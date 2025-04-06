  rm -rf fc
  dnf install epel-release -y
  dnf install htop tar -y
  mkdir fc
  cd fc
  wget https://github.com/firecracker-microvm/firecracker/releases/download/v1.11.0/firecracker-v1.11.0-x86_64.tgz
  gunzip firecracker-v1.11.0-x86_64.tgz
  tar -xf firecracker-v1.11.0-x86_64.tar
  cd release-v1.11.0-x86_64

  cp firecracker-v1.11.0-x86_64 /usr/local/bin/firecracker
  cp jailer-v1.11.0-x86_64 /usr/local/bin/jailer
  cd ..
  setfacl -m u:${USER}:rw /dev/kvm
  [ $(stat -c "%G" /dev/kvm) = kvm ] && usermod -aG kvm ${USER} && echo "Access granted."
  [ -r /dev/kvm ] && [ -w /dev/kvm ] && echo "OK" || echo "FAIL"
  ARCH="x86_64"
  CI_VERSION="v1.11.0"
  wget "https://s3.amazonaws.com/spec.ccfc.min/firecracker-ci/v1.11/x86_64/vmlinux-6.1.102"

  latest_ubuntu_key="firecracker-ci/v1.11/x86_64/ubuntu-24.04.squashfs"
  ubuntu_version="24.04"
  wget -O ubuntu-$ubuntu_version.squashfs.upstream "https://s3.amazonaws.com/spec.ccfc.min/$latest_ubuntu_key"
  unsquashfs ubuntu-$ubuntu_version.squashfs.upstream
  ssh-keygen -f id_rsa -N ""
  cp -v id_rsa.pub squashfs-root/root/.ssh/authorized_keys
  mv -v id_rsa ubuntu-$ubuntu_version.id_rsa
  chown -R root:root squashfs-root
  truncate -s 200G ubuntu-$ubuntu_version.ext4
  mkfs.ext4 -d squashfs-root -F ubuntu-$ubuntu_version.ext4
  useradd -r -s /bin/false fc_user
  JAIL_ROOT="/srv/jailer/firecracker/hello-fc/root"
cat > run_jailer.sh << EOF
  rm -rf /srv/jailer/firecracker
  mkdir -p ${JAIL_ROOT}/rootfs
  cp ubuntu-24.04.ext4 ${JAIL_ROOT}/rootfs
  cp vmlinux-6.1.102 ${JAIL_ROOT}
  chown -R fc_user:fc_user ${JAIL_ROOT}/rootfs
  jailer --id hello-fc --uid $(id -u fc_user) --gid $(id -g fc_user) --chroot-base-dir /srv/jailer --exec-file /usr/local/bin/firecracker -- --api-sock /run/api.sock
EOF
  chmod +x run_jailer.sh
  ./run_jailer.sh &
  sleep 2
  API_SOCKET="${JAIL_ROOT}/run/api.sock"
  cat > run_curls.sh << EOF
  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{ "kernel_image_path": "vmlinux-6.1.102", "boot_args": "console=ttyS0 reboot=k panic=1 pci=off" }' "http://localhost/boot-source"
  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{ "drive_id": "rootfs", "path_on_host": "/rootfs/ubuntu-24.04.ext4", "is_root_device": true, "is_read_only": false }' "http://localhost/drives/rootfs"
  TAP_DEV="tap0"
  TAP_IP="172.16.0.1"
  MASK_SHORT="/30"
  ip link del "$TAP_DEV" 2> /dev/null || true
  ip tuntap add dev "$TAP_DEV" mode tap
  ip addr add "${TAP_IP}${MASK_SHORT}" dev "$TAP_DEV"
  ip link set dev "$TAP_DEV" up
  sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"
  iptables -P FORWARD ACCEPT
  HOST_IFACE=$(ip -j route list default |jq -r ".[0].dev")
  iptables -t nat -D POSTROUTING -o "$HOST_IFACE" -j MASQUERADE || true
  iptables -t nat -A POSTROUTING -o "$HOST_IFACE" -j MASQUERADE
  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{ "iface_id": "net1", "guest_mac": "06:00:AC:10:00:02", "host_dev_name": "tap0" }' "http://localhost/network-interfaces/net1"

  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{"vcpu_count": 2, "mem_size_mib": 32768, "smt": false}' "http://localhost/machine-config"
  sleep 0.015s
  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{"action_type": "InstanceStart"}' "http://localhost/actions"
  sleep 2s
  KEY_NAME=ubuntu-24.04.id_rsa
  ssh -i $KEY_NAME root@172.16.0.2  "ip route add default via 172.16.0.1 dev eth0"
  ssh -i $KEY_NAME root@172.16.0.2  "echo 'nameserver 8.8.8.8' > /etc/resolv.conf"
EOF
  chmod +x run_curls.sh
  ./run_curls.sh

