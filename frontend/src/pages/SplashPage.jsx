import { Link } from 'react-router-dom'
import useTheme from '../hooks/useTheme'

function SplashPage() {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="fixed top-4 right-4">
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>
      </div>
      <div className="max-w-5xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-300 mb-4">shellmates!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Rent bare metal servers and create your own micro-cloud with friends.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Split costs, maximize resources, and build a community of developers.
          </p>
          
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-primary-50 dark:bg-gray-700 rounded-lg p-6 text-left">
              <h2 className="text-2xl font-semibold text-primary-800 dark:text-primary-300 mb-4">How Shellmates Works</h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-primary-600 font-bold mr-2">1.</span>
                  <span>Rent a powerful bare metal server from providers like Hetzner or OVH at prices starting from $34.50/month</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 font-bold mr-2">2.</span>
                  <span>We help you setup Firecracker VMs to divide your server into smaller VMs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 font-bold mr-2">3.</span>
                  <span>Keep what you need and rent out the rest to other developers at fair prices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 font-bold mr-2">4.</span>
                  <span>Save up to 90% compared to cloud providers like AWS while building relationships with other developers</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-800 dark:text-primary-300 mb-4">Why Choose Shellmates?</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400 mb-2">Cost Efficiency</h3>
                <p className="text-gray-600 dark:text-gray-300">Split a $34.50 server into two $17.25 VMs or make a profit renting them at $25 each</p>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400 mb-2">Community</h3>
                <p className="text-gray-600 dark:text-gray-300">Connect with other developers who share your server - put faces to IPs</p>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400 mb-2">Flexibility</h3>
                <p className="text-gray-600 dark:text-gray-300">Be a landlord, tenant, or both - create the perfect VM for your needs</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
            <Link 
              to="/login" 
              className="px-8 py-3 text-lg font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Log In
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-3 text-lg font-medium rounded-md bg-white text-primary-600 border border-primary-600 hover:bg-primary-50 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
        
        <div className="bg-primary-700 text-white p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Bare Metal Servers You Can Split</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center bg-primary-800 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2"><a className="link hover:underline" href="https://hetzner.cloud/?ref=rROuQ1YPYg9q">Hetzner</a></h3>
              <p>64 GB RAM, Intel Core i7-6700, 2x SSD 512 GB for $34.50</p>
              <p className="mt-2 text-primary-200">Split into 2 VMs with 32GB RAM each</p>
            </div>
            <div className="text-center bg-primary-800 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2"><a className="link hover:underline" href="https://us.ovhcloud.com/bare-metal/rise/">OVH Rise</a></h3>
              <p>32 GB RAM, Intel Xeon-E 2386G - 6c/12t - 3.5GHz/4.7GHz, 2x 4TB HDD for $66.50</p>
              <p className="mt-2 text-primary-200">Split into 3 VMs with 10GB RAM each</p>
            </div>
            <div className="text-center bg-primary-800 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2"><a className="link hover:underline" href="https://www.liquidweb.com/dedicated-server-hosting/bare-metal/">LiquidWeb</a></h3>
              <p>16 GB memory, Intel E-2134 4 core @ 3.5 GHz, 2×480 GB SSD for $44.00</p>
              <p className="mt-2 text-primary-200">Split into 2 VMs with 8GB RAM each</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center mb-6">Available Spots from Our Community</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-primary-800 rounded-lg p-4 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary-300 mb-3 overflow-hidden">
                <img src="https://randomuser.me/api/portraits/women/12.jpg" alt="Sarah K." className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold">Sarah K. offers:</h3>
              <p className="text-center">16GB RAM, 2 cores, 128GB SSD</p>
              <p className="text-primary-300 mt-1">$15/month - Berlin</p>
            </div>
            <div className="bg-primary-800 rounded-lg p-4 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary-300 mb-3 overflow-hidden">
                <img src="https://randomuser.me/api/portraits/men/42.jpg" alt="David T." className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold">David T. offers:</h3>
              <p className="text-center">32GB RAM, 4 cores, 256GB SSD</p>
              <p className="text-primary-300 mt-1">$22/month - San Francisco</p>
            </div>
            <div className="bg-primary-800 rounded-lg p-4 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary-300 mb-3 overflow-hidden">
                <img src="https://randomuser.me/api/portraits/women/36.jpg" alt="Mia L." className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold">Mia L. offers:</h3>
              <p className="text-center">8GB RAM, 1 core, 64GB SSD</p>
              <p className="text-primary-300 mt-1">$8/month - Tokyo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplashPage
