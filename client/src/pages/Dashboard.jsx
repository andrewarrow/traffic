import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

function Dashboard() {
  const { currentUser, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState('applications')
  const [trafficRate, setTrafficRate] = useState(1)
  const [appStatus, setAppStatus] = useState('Running')
  const [isPaused, setIsPaused] = useState(false)
  
  // Auto-increase traffic rate by 1 request per second
  useEffect(() => {
    if (isPaused || trafficRate >= 10000) return;
    
    const timer = setInterval(() => {
      setTrafficRate(prev => Math.min(prev + 1, 10000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused, trafficRate]);
  
  // Update application status based on traffic rate
  useEffect(() => {
    if (trafficRate < 100) {
      setAppStatus('Running')
    } else if (trafficRate < 1000) {
      setAppStatus('Warning')
    } else if (trafficRate < 5000) {
      setAppStatus('Error')
    } else {
      setAppStatus('Failed')
    }
  }, [trafficRate])

  const handleLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      logout()
      setIsLoggingOut(false)
    }, 500) // Simulate a slight delay
  }

  // AWS-style services
  const recentServices = [
    { id: 'ec2', name: 'EC2', description: 'Virtual servers in the cloud', icon: '⬛' },
    { id: 'route53', name: 'Route53', description: 'Scalable DNS and domain name registration', icon: '⚪' },
    { id: 'elasticache', name: 'Elasticache', description: 'In-memory caching service', icon: '🔷' },
    { id: 'dynamodb', name: 'DynamoDB', description: 'Managed NoSQL database', icon: '🔶' },
    { id: 'rds', name: 'RDS', description: 'Managed relational database service', icon: '🔵' },
    { id: 'eks', name: 'EKS', description: 'Managed Kubernetes service', icon: '🟢' },
    { id: 'ecr', name: 'ECR', description: 'Container registry service', icon: '📦' }
  ]

  // Application data
  const applications = [
    { 
      id: 1, 
      name: 'trafficforums.com', 
      status: appStatus, 
      ipAddress: '18.223.45.167',
      route53: 'trafficforums.com',
      instanceId: 'i-07c5abf2d32f9823a',
      requestsPerSecond: trafficRate
    }
  ]

  const renderTabContent = () => {
    switch(activeTab) {
      case 'applications':
        return (
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                        <div className={`text-xs ${
                          app.status === 'Running' ? 'text-green-600' :
                          app.status === 'Warning' ? 'text-yellow-600' :
                          app.status === 'Error' ? 'text-orange-600' :
                          'text-red-600 font-medium'
                        }`}>{app.status}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.status === 'Running' ? 'bg-green-100 text-green-800' :
                          app.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'Error' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">{app.requestsPerSecond} requests/sec</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <span className="w-20 text-xs text-gray-500">Domain:</span>
                            <a href="#route53" className="text-blue-600 hover:underline text-xs ml-2">{app.route53}</a>
                          </div>
                          <div className="flex items-center">
                            <span className="w-20 text-xs text-gray-500">IP Address:</span>
                            <span className="text-xs ml-2">{app.ipAddress}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-20 text-xs text-gray-500">EC2 Instance:</span>
                            <a href="#ec2" className="text-blue-600 hover:underline text-xs ml-2">{app.instanceId}</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'resources':
        return (
          <div className="mt-4">
            <p className="text-sm text-gray-700">No resources currently used.</p>
          </div>
        )
      case 'monitoring':
        return (
          <div className="mt-4">
            <p className="text-sm text-gray-700">Monitoring data will appear here.</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* AWS-like Navigation Header */}
      <header className="bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold">Traffic Console</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-sm hover:text-gray-300">Services</a>
              <a href="#" className="text-sm hover:text-gray-300">Resource Groups</a>
              <a href="#" className="text-sm hover:text-gray-300">Documentation</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              {currentUser?.username} <span className="text-xs">▼</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors disabled:bg-gray-700"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Traffic Simulator Progress Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800">Traffic Simulator</h2>
            <div className="flex items-center gap-4">
              <div className="flex">
                <button 
                  onClick={() => setIsPaused(!isPaused)} 
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title={isPaused ? "Resume traffic" : "Pause traffic"}
                >
                  {isPaused ? 
                    <span className="text-2xl">▶️</span> :
                    <span className="text-2xl">⏸️</span>
                  }
                </button>
                <button 
                  onClick={() => {
                    setTrafficRate(1);
                    setIsPaused(false);
                  }} 
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Reset traffic"
                >
                  <span className="text-2xl">🔄</span>
                </button>
              </div>
              <div className="text-lg font-bold text-blue-600">{trafficRate} requests/sec</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 font-medium">1</span>
            <div className="w-full relative h-5 bg-gray-200 rounded-lg overflow-hidden">
              <div 
                className={`h-full rounded-lg transition-all ${
                  appStatus === 'Running' ? 'bg-green-500' :
                  appStatus === 'Warning' ? 'bg-yellow-500' :
                  appStatus === 'Error' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(trafficRate / 10000) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 font-medium">10k</span>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Automatically increasing traffic to test application scaling response
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Recently visited services (50%) */}
          <div className="md:w-1/2">
            <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-800 mb-3 border-b pb-2">Recently visited services</h3>
              <div className="grid grid-cols-2 gap-2">
                {recentServices.map(service => (
                  <a 
                    key={service.id}
                    href={`#${service.id}`}
                    className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <div className="text-lg mr-2">{service.icon}</div>
                    <h4 className="text-sm font-medium text-gray-800">{service.name}</h4>
                  </a>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white shadow-sm rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3 border-b pb-2">System Health</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-700">Simulation Server Load</span>
                    <span className="text-xs text-gray-700">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-700">Database Usage</span>
                    <span className="text-xs text-gray-700">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-700">Network Traffic</span>
                    <span className="text-xs text-gray-700">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Applications tab (50%) */}
          <div className="md:w-1/2">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b">
                <button 
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'applications' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('applications')}
                >
                  Applications
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'resources' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('resources')}
                >
                  Resources
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'monitoring' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('monitoring')}
                >
                  Monitoring
                </button>
              </div>

              {/* Tab content */}
              <div className="p-4">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
