import { ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="w-16 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">PP</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted platform for seamless futsal court bookings.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-300 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Career</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-300 uppercase tracking-wider">Help</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Customer Support</a></li>
              <li><a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Delivery Details</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-300 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Free eBooks</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Development Tutorial</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">How to - Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Youtube Playlist</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm text-center md:text-left">
            Copyright © 2025 PitchPal. All rights reserved
          </p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95">
            Get Started
          </button>
        </div>
      </div>
    </footer>
  );
}
