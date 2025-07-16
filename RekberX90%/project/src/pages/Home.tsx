import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useChat } from '../contexts/SupabaseChatContext';
import { TowerControl as GameController2, Shield, MessageCircle, Users, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { gameTopics } = useChat();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <GameController2 className="h-20 w-20 mx-auto mb-6 text-blue-200" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              RekberX
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Platform Transaksi Gaming Terpercaya dengan Sistem Rekber Aman
            </p>
          </div>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Daftar Gratis</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chat"
                className="group px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Mulai JB</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/profile"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Profil Saya
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cara Kerja RekberX</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sistem yang mudah dan aman untuk transaksi gaming
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Chat di Grup Game</h3>
              <p className="text-gray-600 leading-relaxed">Masuk ke chat publik game yang ingin dijual atau dibeli</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Klik ID User</h3>
              <p className="text-gray-600 leading-relaxed">Klik ID user untuk mengundang ke grup Rekber</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Transaksi Aman</h3>
              <p className="text-gray-600 leading-relaxed">Admin membantu memastikan transaksi berjalan aman</p>
            </div>
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Game Yang Tersedia</h2>
            <p className="text-xl text-gray-600">Pilih game favorit Anda untuk mulai trading</p>
          </div>
          

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameTopics.map((topic, index) => (
              <div key={topic.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-gray-100">
                <div className={`w-16 h-16 bg-gradient-to-br ${
                  index % 4 === 0 ? 'from-orange-400 to-red-500' :
                  index % 4 === 1 ? 'from-yellow-400 to-orange-500' :
                  index % 4 === 2 ? 'from-blue-400 to-purple-500' :
                  'from-green-400 to-blue-500'
                } rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden`}>
                  {topic.iconUrl ? (
                    <img
                      src={topic.iconUrl}
                      alt={topic.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to text icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-white font-bold text-xl"
                    style={{ display: topic.iconUrl ? 'none' : 'block' }}
                  >
                    {topic.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{topic.name}</h3>
                <p className="text-gray-600">{topic.description}</p>
              </div>
            ))}
          </div>
          
          {gameTopics.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading games...</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Mulai Trading Sekarang</h2>
            <p className="text-xl mb-8 text-blue-100">
              Platform demo - semua fitur berfungsi dengan localStorage
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
            >
              <span>Daftar Gratis</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;