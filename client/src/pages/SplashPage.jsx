import { Link } from 'react-router-dom'

function SplashPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              <span className="text-orange-500">Traffic</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Your simulator for learning how to handle system scaling challenges
            </p>
            <p className="text-gray-500">
              Develop the skills to scale applications through hands-on experience
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <Link 
              to="/login" 
              className="px-8 py-3 text-lg font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              Log In
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-3 text-lg font-medium rounded-md bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-orange-300 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-800 text-white p-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3 text-orange-400">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Learn Scaling</h3>
              <p>Master techniques to handle increasing traffic loads in a safe environment</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3 text-orange-400">🖥️</div>
              <h3 className="text-xl font-semibold mb-2">AWS-Style Console</h3>
              <p>Experience a familiar interface similar to real cloud infrastructure</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3 text-orange-400">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Hands-on Practice</h3>
              <p>Apply solutions to real-world scaling challenges and see immediate results</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Already have an account? Use the test username: <strong>andrewarrow</strong> and password: <strong>testing</strong> to log in</p>
      </div>
    </div>
  )
}

export default SplashPage
