import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'

// Utility function to format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Color utility based on utilization percentage
const getUtilizationColor = (percentage) => {
  if (percentage > 90) return 'bg-red-500'
  if (percentage > 70) return 'bg-orange-400'
  if (percentage > 50) return 'bg-yellow-400'
  return 'bg-green-500'
}

function Dashboard() {
  const { currentUser, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userCount, setUserCount] = useState(1)
  const [sliderValue, setSliderValue] = useState(0) // 0-100 for visual percentage
  const [cpuUsage, setCpuUsage] = useState(2)
  const [memoryUsage, setMemoryUsage] = useState(5)
  const [subforumCount, setSubforumCount] = useState(1)
  const [postCount, setPostCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [isSimulationRunning, setIsSimulationRunning] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [systemDown, setSystemDown] = useState(false)
  const [architecture, setArchitecture] = useState({
    database: 'sqlite',
    servers: 1,
    deployment: 'single-ec2',
  })
  
  const trafficSources = [
    { name: 'Organic Search', percentage: 45 },
    { name: 'Direct', percentage: 30 },
    { name: 'Social Media', percentage: 15 },
    { name: 'Referral', percentage: 10 },
  ]
  
  const simulationInterval = useRef(null)
  const growthRate = useRef(1.01) // Initial faster growth
  const earlySpikeDone = useRef(false) // Track if early spike happened
  
  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning)
  }
  
  const resetSimulation = () => {
    setUserCount(1)
    setSliderValue(0)
    setCpuUsage(2)
    setMemoryUsage(5)
    setSubforumCount(1)
    setPostCount(0)
    setCommentCount(0)
    setTimeElapsed(0)
    setSystemDown(false)
    setArchitecture({
      database: 'sqlite',
      servers: 1,
      deployment: 'single-ec2',
    })
    growthRate.current = 1.01
    earlySpikeDone.current = false
    setIsSimulationRunning(true)
  }
  
  const upgradeDatabase = (dbType) => {
    setArchitecture({ ...architecture, database: dbType })
    // This would temporarily decrease CPU usage a bit
    setCpuUsage(prev => Math.max(prev - 20, 0))
  }
  
  const addServer = () => {
    if (architecture.servers === 1) {
      // First additional server requires a load balancer
      setArchitecture({ 
        ...architecture, 
        servers: architecture.servers + 1,
        deployment: 'ec2-with-load-balancer'
      })
    } else {
      setArchitecture({ 
        ...architecture, 
        servers: architecture.servers + 1
      })
    }
    // This would temporarily decrease CPU usage
    setCpuUsage(prev => Math.max(prev - 30, 0))
  }
  
  const moveToK8s = () => {
    setArchitecture({ 
      ...architecture, 
      deployment: 'kubernetes',
      servers: architecture.servers + 2 // Assume k8s starts with more instances
    })
    // This would temporarily decrease CPU usage significantly
    setCpuUsage(prev => Math.max(prev - 40, 0))
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      logout()
      setIsLoggingOut(false)
    }, 500) // Simulate a slight delay
  }
  
  useEffect(() => {
    if (isSimulationRunning && !systemDown) {
      simulationInterval.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
        
        // Early mini hockey stick spike after a few seconds (timeElapsed > 4)
        if (timeElapsed > 4 && timeElapsed < 15 && !earlySpikeDone.current) {
          growthRate.current = 1.3 // Sharp early spike
        } 
        // Detect if user has upgraded infrastructure
        else if ((architecture.database !== 'sqlite' || architecture.servers > 1 || 
                 architecture.deployment !== 'single-ec2') && 
                 growthRate.current > 1.05) {
          // Slow down growth after user takes action
          growthRate.current = 1.02
          earlySpikeDone.current = true
        }
        // If user took no action, continue with normal growth pattern
        else if (timeElapsed >= 15) {
          if (userCount > 10000) {
            growthRate.current = 1.1
          } else if (userCount > 1000) {
            growthRate.current = 1.05
          } else if (userCount > 100) {
            growthRate.current = 1.03
          }
          earlySpikeDone.current = true
        }
        
        // Update user count based on growth rate
        const newUserCount = Math.floor(userCount * growthRate.current)
        setUserCount(newUserCount)
        
        // Update slider value (0-100)
        const logUserCount = Math.log10(newUserCount)
        const newSliderValue = Math.min((logUserCount / 8) * 100, 100) // 8 is log10(100M)
        setSliderValue(newSliderValue)
        
        // Generate related metrics
        const newSubforumCount = Math.floor(Math.sqrt(newUserCount) / 2)
        setSubforumCount(Math.max(newSubforumCount, 1))
        
        const newPostCount = Math.floor(newUserCount * 0.05) // 5% of users create posts
        setPostCount(newPostCount)
        
        const newCommentCount = Math.floor(newPostCount * 10) // 10 comments per post on average
        setCommentCount(newCommentCount)
        
        // Stress system resources based on load and architecture
        let newCpuUsage, newMemoryUsage
        
        // Base calculations
        const userStress = newSliderValue / 100 * 120 // Over 100% possible - system breaking
        
        // Apply modifiers based on architecture
        const dbModifier = 
          architecture.database === 'sqlite' ? 1 :
          architecture.database === 'mysql' ? 0.7 :
          architecture.database === 'postgres' ? 0.65 :
          architecture.database === 'dynamodb' ? 0.4 : 0.8
        
        const serverModifier = 1 / (architecture.servers * 0.9)
        
        const deploymentModifier = 
          architecture.deployment === 'single-ec2' ? 1 :
          architecture.deployment === 'ec2-with-load-balancer' ? 0.7 :
          architecture.deployment === 'kubernetes' ? 0.4 : 0.8
          
        newCpuUsage = userStress * dbModifier * serverModifier * deploymentModifier
        newMemoryUsage = (userStress * 0.8) * dbModifier * serverModifier * deploymentModifier
        
        setCpuUsage(Math.min(newCpuUsage, 100))
        setMemoryUsage(Math.min(newMemoryUsage, 100))
        
        // System goes down if CPU > 95% for too long
        if (newCpuUsage > 95 && architecture.database === 'sqlite' && architecture.servers === 1) {
          setTimeout(() => {
            setSystemDown(true)
            setIsSimulationRunning(false)
          }, 5000)
        }
      }, 500)
    } else {
      clearInterval(simulationInterval.current)
    }
    
    return () => clearInterval(simulationInterval.current)
  }, [isSimulationRunning, userCount, architecture, systemDown, timeElapsed])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with user slider */}
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-white">Forums</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {currentUser?.username}</span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-600"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
          
          {/* User count slider */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="text-sm font-medium">1 user</div>
            <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out bg-blue-500"
                style={{ width: `${sliderValue}%` }}
              ></div>
            </div>
            <div className="text-sm font-medium">100M users</div>
            <div className="ml-2 text-lg font-semibold">{formatNumber(userCount)}</div>
          </div>
        </div>
      </header>

      {systemDown ? (
        <div className="fixed inset-0 flex items-center justify-center bg-red-900 bg-opacity-95 z-50">
          <div className="text-center p-8">
            <h2 className="text-6xl font-bold text-white mb-4">SYSTEM DOWN</h2>
            <p className="text-xl mb-8">Your infrastructure couldn't handle the load</p>
            <button
              onClick={resetSimulation}
              className="px-6 py-3 bg-white text-red-900 rounded-md font-bold hover:bg-gray-200"
            >
              Restart Simulation
            </button>
          </div>
        </div>
      ) : null}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={toggleSimulation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2"
          >
            {isSimulationRunning ? 'Pause Simulation' : 'Resume Simulation'}
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2"
          >
            Reset Simulation
          </button>
          <div className="text-sm text-gray-400 py-2">
            Simulation time: {Math.floor(timeElapsed / 120)} days
          </div>
        </div>
        
        {/* Metrics and graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* EC2 instance */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">
                Infrastructure: {architecture.deployment === 'kubernetes' ? 'Kubernetes Cluster' : 
                  architecture.servers > 1 ? `${architecture.servers} EC2 instances` : 'Single EC2 Instance'}
              </h3>
              <span className={`h-3 w-3 rounded-full ${cpuUsage > 90 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>CPU Usage</span>
                <span className={cpuUsage > 90 ? 'text-red-400 font-bold' : cpuUsage > 70 ? 'text-orange-400' : ''}>{cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                <div 
                  className={`h-2.5 rounded-full ${getUtilizationColor(cpuUsage)}`}
                  style={{ width: `${cpuUsage}%`, transition: 'width 0.5s ease-out, background-color 0.5s ease-out' }}
                ></div>
              </div>
              
              <div className="flex justify-between mb-1">
                <span>Memory Usage</span>
                <span className={memoryUsage > 90 ? 'text-red-400 font-bold' : memoryUsage > 70 ? 'text-orange-400' : ''}>{memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${getUtilizationColor(memoryUsage)}`}
                  style={{ width: `${memoryUsage}%`, transition: 'width 0.5s ease-out, background-color 0.5s ease-out' }}
                ></div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Database</span>
                <span className={architecture.database === 'sqlite' && userCount > 10000 ? 'text-red-400 font-bold' : ''}>
                  {architecture.database.toUpperCase()}
                </span>
              </div>
              
              <div className="text-xs text-gray-400 mt-2 mb-4">
                {architecture.database === 'sqlite' && userCount > 10000 ? 
                  'SQLite is not designed for high concurrency!' : 
                  'Database status: operational'}
              </div>
            </div>
          </div>
          
          {/* Traffic metrics */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h3 className="text-xl font-medium mb-4">Site Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Users</div>
                <div className="text-xl font-semibold">{formatNumber(userCount)}</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Subforums</div>
                <div className="text-xl font-semibold">{formatNumber(subforumCount)}</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Posts</div>
                <div className="text-xl font-semibold">{formatNumber(postCount)}</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Comments</div>
                <div className="text-xl font-semibold">{formatNumber(commentCount)}</div>
              </div>
            </div>
            
            <h4 className="text-lg font-medium mb-2">Traffic Sources</h4>
            {trafficSources.map(source => (
              <div key={source.name} className="mb-2">
                <div className="flex justify-between mb-1 text-sm">
                  <span>{source.name}</span>
                  <span>{source.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Growth visualization */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h3 className="text-xl font-medium mb-4">User Growth Rate</h3>
            
            <div className="flex items-end h-48 mb-4 space-x-2">
              {Array.from({ length: 24 }).map((_, i) => {
                // Create visual pattern with early spike followed by slower growth then acceleration
                let height;
                if (i === 3 || i === 4) {
                  // Early spike
                  height = 60;
                } else if (i < 3) {
                  // Start
                  height = Math.min(100, (Math.pow(1.2, i) / Math.pow(1.2, 23)) * 100);
                } else if (i > 4 && i < 10) {
                  // Post-spike stabilization
                  height = Math.min(100, (Math.pow(1.1, i) / Math.pow(1.1, 23)) * 100 + 20);
                } else {
                  // Later hockey stick
                  height = Math.min(100, (Math.pow(1.5, i - 9) / Math.pow(1.5, 14)) * 100);
                }
                
                return (
                  <div 
                    key={i} 
                    className={`rounded-t w-full ${i === 3 || i === 4 ? 'bg-orange-500' : 'bg-blue-500'}`}
                    style={{ height: `${height}%` }}
                  ></div>
                );
              })}
            </div>
            
            <div className="text-sm text-gray-400 flex justify-between">
              <span>Start</span>
              <span>Time: {Math.floor(timeElapsed / 2)} seconds</span>
            </div>
            
            <div className="mt-6">
              <div className="text-sm text-gray-400">Growth Factor:</div>
              <div className="text-xl font-semibold">{((growthRate.current - 1) * 100).toFixed(1)}% per tick</div>
              <div className="text-sm text-gray-400 mt-1">
                {growthRate.current > 1.2 ? 
                  'TRAFFIC SPIKE!' : 
                  userCount > 10000 ? 'Viral growth phase' : 
                  userCount > 1000 ? 'Acceleration phase' : 
                  'Early adoption phase'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 mb-8">
          <h3 className="text-xl font-medium mb-4">Scale Your Infrastructure</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-4">
              <h4 className="font-medium">Database Options</h4>
              <button
                onClick={() => upgradeDatabase('mysql')}
                disabled={architecture.database !== 'sqlite'}
                className={`w-full px-4 py-2 text-sm rounded-md ${
                  architecture.database === 'mysql' ? 'bg-green-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:bg-gray-600 disabled:cursor-not-allowed`}
              >
                Migrate to MySQL
              </button>
              <button
                onClick={() => upgradeDatabase('postgres')}
                disabled={architecture.database !== 'sqlite' && architecture.database !== 'mysql'}
                className={`w-full px-4 py-2 text-sm rounded-md ${
                  architecture.database === 'postgres' ? 'bg-green-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:bg-gray-600 disabled:cursor-not-allowed`}
              >
                Migrate to PostgreSQL
              </button>
              <button
                onClick={() => upgradeDatabase('dynamodb')}
                disabled={architecture.database === 'dynamodb'}
                className={`w-full px-4 py-2 text-sm rounded-md ${
                  architecture.database === 'dynamodb' ? 'bg-green-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:bg-gray-600 disabled:cursor-not-allowed`}
              >
                Migrate to DynamoDB
              </button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Compute Resources</h4>
              <button
                onClick={addServer}
                className="w-full px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add EC2 Instance
              </button>
              <div className="text-xs text-gray-400">
                Current: {architecture.servers} {architecture.servers === 1 ? 'instance' : 'instances'}
                {architecture.servers > 1 && ' with load balancer'}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Deployment Options</h4>
              <button
                onClick={moveToK8s}
                disabled={architecture.deployment === 'kubernetes'}
                className={`w-full px-4 py-2 text-sm rounded-md ${
                  architecture.deployment === 'kubernetes' ? 'bg-green-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:bg-gray-600 disabled:cursor-not-allowed`}
              >
                Migrate to Kubernetes
              </button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Options</h4>
              <button
                className="w-full px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700 text-white"
              >
                Enable Caching
              </button>
              <button
                className="w-full px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700 text-white"
              >
                Add CDN
              </button>
              <button
                className="w-full px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700 text-white"
              >
                Geo-Distribute
              </button>
            </div>
          </div>
        </div>
        
        {/* Warning alerts */}
        {timeElapsed > 4 && timeElapsed < 15 && earlySpikeDone.current === false ? (
          <div className="bg-purple-900 border border-purple-700 text-white p-4 rounded-md shadow-lg mb-4 animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Traffic Spike Detected!</h3>
                <div className="mt-2 text-sm">
                  <p>Your site is experiencing a sudden surge in traffic. Your infrastructure may need upgrades soon!</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        {cpuUsage > 90 ? (
          <div className="bg-red-900 border border-red-700 text-white p-4 rounded-md shadow-lg mb-4 animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Critical CPU Utilization</h3>
                <div className="mt-2 text-sm">
                  <p>Your system is about to crash! Take action immediately!</p>
                </div>
              </div>
            </div>
          </div>
        ) : cpuUsage > 75 ? (
          <div className="bg-orange-900 border border-orange-700 text-white p-4 rounded-md shadow-lg mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">High CPU Utilization</h3>
                <div className="mt-2 text-sm">
                  <p>Your system is experiencing heavy load. Consider scaling up.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        {architecture.database === 'sqlite' && userCount > 10000 ? (
          <div className="bg-yellow-900 border border-yellow-700 text-white p-4 rounded-md shadow-lg mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Database Bottleneck</h3>
                <div className="mt-2 text-sm">
                  <p>SQLite is not designed for high concurrency. Consider upgrading your database.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Detailed metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
            <h3 className="font-medium mb-2">Active Connections</h3>
            <div className="text-2xl font-bold">{formatNumber(Math.floor(userCount * 0.1))}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
            <h3 className="font-medium mb-2">New Posts/Minute</h3>
            <div className="text-2xl font-bold">{formatNumber(Math.floor(userCount * 0.001))}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
            <h3 className="font-medium mb-2">Response Time</h3>
            <div className="text-2xl font-bold">
              {cpuUsage > 90 ? '> 5000' : cpuUsage > 70 ? formatNumber(Math.floor(200 + cpuUsage * 5)) : formatNumber(Math.floor(50 + cpuUsage * 2))} ms
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
            <h3 className="font-medium mb-2">Error Rate</h3>
            <div className="text-2xl font-bold">
              {cpuUsage > 90 ? '> 10%' : cpuUsage > 80 ? '5%' : cpuUsage > 70 ? '2%' : '< 1%'}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard