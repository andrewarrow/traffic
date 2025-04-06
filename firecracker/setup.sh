  rm -rf fc
  dnf install epel-release -y
  dnf install htop tar iptables-services -y
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
cat > run_jailer.sh << EOF
#!/bin/bash
set -e

JAIL_ID="hello-fc"
JAIL_ROOT="/srv/jailer/firecracker/hello-fc/root"
ROOTFS_NAME="ubuntu-24.04.ext4"
KERNEL_NAME="vmlinux-6.1.102"
FC_USER="fc_user"
ROOTFS_SOURCE="/root/fc/ubuntu-24.04.ext4"
KERNEL_SOURCE="/root/fc/vmlinux-6.1.102"

if [ -d "/srv/jailer/firecracker/hello-fc/root/rootfs" ] && [ -f "/srv/jailer/firecracker/hello-fc/root/rootfs/ubuntu-24.04.ext4" ]; then
  cp /srv/jailer/firecracker/hello-fc/root/rootfs/ubuntu-24.04.ext4 /root/fc-rootfs-save
fi

rm -rf /srv/jailer/firecracker
mkdir -p "/srv/jailer/firecracker/hello-fc/root/rootfs"

if [ -s /root/fc-rootfs-save ]; then
  mv /root/fc-rootfs-save /srv/jailer/firecracker/hello-fc/root/rootfs/ubuntu-24.04.ext4
  echo "Restored previous rootfs image"
else
  cp /root/fc/ubuntu-24.04.ext4 /srv/jailer/firecracker/hello-fc/root/rootfs/
  echo "Copied fresh rootfs image"
fi

cp /root/fc/vmlinux-6.1.102 /srv/jailer/firecracker/hello-fc/root/
chown -R ":" /srv/jailer/firecracker/hello-fc/root/rootfs
exec /usr/local/bin/jailer --id "hello-fc" --uid "0" --gid "0" --chroot-base-dir /srv/jailer --exec-file /usr/local/bin/firecracker -- --api-sock /run/api.sock
EOF
cat > /etc/systemd/system/fcjail.service << EOF
[Unit]
Description=Firecracker Jailer Service
After=network.target
Requires=network.target

[Service]
Type=simple
User=root
Group=root
ExecStart=/root/fc/run_jailer.sh
ExecStartPost=/bin/bash -c "sleep 3 && /root/fc/run_curls.sh"
CapabilityBoundingSet=CAP_SYS_ADMIN CAP_MKNOD CAP_DAC_OVERRIDE CAP_CHOWN CAP_SETUID CAP_SETGID
AmbientCapabilities=CAP_SYS_ADMIN CAP_MKNOD CAP_DAC_OVERRIDE CAP_CHOWN CAP_SETUID CAP_SETGID
SecureBits=keep-caps
PrivateMounts=no
#StandardOutput=null
#StandardError=null

Restart=on-failure
RestartSec=5s

LimitNOFILE=1048576
LimitMEMLOCK=infinity

KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=10

[Install]
WantedBy=multi-user.target
EOF
  chmod +x run_jailer.sh
  chmod 644 /etc/systemd/system/fcjail.service
  systemctl daemon-reload
  systemctl enable fcjail.service
  systemctl start fcjail.service
  #TAP_DEV="tap0"
  #TAP_IP="172.16.0.1"
  #MASK_SHORT="/30"
  #ip link del "$TAP_DEV" 2> /dev/null || true
  #ip tuntap add dev "$TAP_DEV" mode tap
  #ip addr add "${TAP_IP}${MASK_SHORT}" dev "$TAP_DEV"
  #ip link set dev "$TAP_DEV" up
  sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"
  #iptables -P FORWARD ACCEPT
  #HOST_IFACE="enp0s31f6"
  #iptables -t nat -D POSTROUTING -o "$HOST_IFACE" -j MASQUERADE || true
  #iptables -t nat -A POSTROUTING -o "$HOST_IFACE" -j MASQUERADE
  systemctl enable iptables
  systemctl start iptables
cat > /etc/sysconfig/iptables << EOF
# Generated by iptables-save v1.8.10 (nf_tables) on Sun Apr  6 21:49:00 2025
*mangle
:PREROUTING ACCEPT [0:0]
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]
COMMIT
# Completed on Sun Apr  6 21:49:00 2025
# Generated by iptables-save v1.8.10 (nf_tables) on Sun Apr  6 21:49:00 2025
*raw
:PREROUTING ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
COMMIT
# Completed on Sun Apr  6 21:49:00 2025
# Generated by iptables-save v1.8.10 (nf_tables) on Sun Apr  6 21:49:00 2025
*filter
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [193:40778]
-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
-A INPUT -p icmp -j ACCEPT
-A INPUT -i lo -j ACCEPT
-A INPUT -p tcp -m state --state NEW -m tcp --dport 22 -j ACCEPT
-A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
-A INPUT -p tcp -m tcp --dport 443 -j ACCEPT
-A INPUT -j REJECT --reject-with icmp-host-prohibited
-A INPUT -i br0 -p tcp -m tcp --dport 22 -j DROP
-A FORWARD -i br0 -o enp0s31f6 -j ACCEPT
-A FORWARD -i enp0s31f6 -o br0 -m state --state RELATED,ESTABLISHED -j ACCEPT
-A FORWARD -d 172.16.0.2/32 -p tcp -m tcp --dport 22 -j ACCEPT
-A FORWARD -d 172.16.0.3/32 -p tcp -m tcp --dport 22 -j ACCEPT
-A FORWARD -i br0 -p udp -m udp --dport 53 -j ACCEPT
-A FORWARD -i br0 -p tcp -m tcp --dport 53 -j ACCEPT
-A FORWARD -p udp -m udp --dport 53 -j ACCEPT
-A FORWARD -p tcp -m tcp --dport 53 -j ACCEPT
-A FORWARD -i br0 -p udp -m udp --dport 53 -j ACCEPT
-A FORWARD -i br0 -p tcp -m tcp --dport 53 -j ACCEPT
COMMIT
# Completed on Sun Apr  6 21:49:00 2025
# Generated by iptables-save v1.8.10 (nf_tables) on Sun Apr  6 21:49:00 2025
*nat
:PREROUTING ACCEPT [81:4528]
:INPUT ACCEPT [8:432]
:OUTPUT ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]
-A PREROUTING -p tcp -m tcp --dport 2201 -j DNAT --to-destination 172.16.0.2:22
-A PREROUTING -p tcp -m tcp --dport 2202 -j DNAT --to-destination 172.16.0.3:22
-A POSTROUTING -s 172.16.0.0/24 -o enp0s31f6 -j MASQUERADE
COMMIT
# Completed on Sun Apr  6 21:49:00 2025
EOF
  systemctl restart iptables
cat > run_curls.sh << 'EOF'
  JAIL_ROOT="/srv/jailer/firecracker/root"
  API_SOCKET="${JAIL_ROOT}/run/api.sock"
  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{ "kernel_image_path": "vmlinux-6.1.102", "boot_args": "console=ttyS0 reboot=k panic=1 pci=off" }' "http://localhost/boot-source"
  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{ "drive_id": "rootfs", "path_on_host": "/rootfs/ubuntu-24.04.ext4", "is_root_device": true, "is_read_only": false }' "http://localhost/drives/rootfs"
  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{ "iface_id": "net1", "guest_mac": "06:00:AC:10:00:02", "host_dev_name": "tap0" }' "http://localhost/network-interfaces/net1"

  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{"vcpu_count": 2, "mem_size_mib": 32768, "smt": false}' "http://localhost/machine-config"
  sleep 0.015s
  curl -i -X PUT --unix-socket "${API_SOCKET}" --data '{"action_type": "InstanceStart"}' "http://localhost/actions"
  sleep 2s
  KEY_NAME=/root/fc/ubuntu-24.04.id_rsa
  ssh -i $KEY_NAME root@172.16.0.2  "ip route add default via 172.16.0.1 dev eth0"
  ssh -i $KEY_NAME root@172.16.0.2  "echo 'nameserver 8.8.8.8' > /etc/resolv.conf"
  exit 0
EOF
  chmod +x run_curls.sh
  sleep 5s
  ./run_curls.sh
