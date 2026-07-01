import { Link } from 'react-router-dom';
import { GraduationCap, Globe, MessageCircle, Users, PlayCircle, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const footerLinks = {
  Explore: [
    { label: 'Search Colleges', path: '/search' },
    { label: 'Compare Colleges', path: '/compare' },
    { label: 'Find My College', path: '/questionnaire' },
    { label: 'Top Engineering', path: '/search?stream=Engineering' },
    { label: 'Top Medical', path: '/search?stream=Medical' },
    { label: 'Top B-Schools', path: '/search?stream=Business' },
  ],
  Platform: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Bookmarks', path: '/dashboard/bookmarks' },
    { label: 'Applications', path: '/dashboard/applications' },
    { label: 'AI Recommendations', path: '/dashboard/recommendations' },
  ],
  Company: [
    { label: 'About Us', path: '#' },
    { label: 'Blog', path: '#' },
    { label: 'Careers', path: '#' },
    { label: 'Press Kit', path: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', path: '#' },
    { label: 'Terms of Service', path: '#' },
    { label: 'Cookie Policy', path: '#' },
    { label: 'Disclaimer', path: '#' },
  ],
};

const socials = [
  { icon: <Globe size={17} />, href: '#', label: 'Website' },
  { icon: <MessageCircle size={17} />, href: '#', label: 'Discord' },
  { icon: <Users size={17} />, href: '#', label: 'Community' },
  { icon: <PlayCircle size={17} />, href: '#', label: 'YouTube' },
];

const stats = [
  { value: '2,500+', label: 'Colleges' },
  { value: '15,000+', label: 'Students' },
  { value: '8,000+', label: 'Reviews' },
];

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#060612] border-t border-gray-100 dark:border-[#1c1c35]">
      {/* CTA strip */}
      <div className="bg-gradient-to-r from-[#6b5fff] via-[#8b5cf6] to-[#06b6d4] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Ready to find your perfect college?
            </h3>
            <p className="text-white/75 mt-1 text-sm">
              Join 15,000+ students already using CampusNavigator.
            </p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#6b5fff] font-semibold text-sm hover:bg-white/95 hover:-translate-y-px transition-all shadow-xl shadow-black/15"
          >
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-6 lg:col-span-3">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6b5fff] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6b5fff]/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Campus<span className="gradient-text">Navigator</span>
              </span>
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 max-w-xs">
              India's most trusted AI-powered college discovery platform. Find, compare, and choose your perfect institution with data-driven insights.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-gray-50 dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-base font-bold gradient-text">{s.value}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-2">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl border border-gray-200 dark:border-[#1c1c35] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#6b5fff] dark:hover:text-[#a89fff] hover:border-[#6b5fff]/30 hover:bg-[#6b5fff]/5 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links], idx) => (
            <div key={title} className="col-span-1 md:col-span-3 lg:col-span-2">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#6b5fff] dark:hover:text-[#a89fff] transition-colors leading-none"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div className="col-span-2 md:col-span-6 lg:col-span-3">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">
              Contact
            </h4>
            <div className="space-y-3">
              {[
                { icon: <Mail size={15} />, text: 'hello@campusnavigator.in' },
                { icon: <Phone size={15} />, text: '+91 1800 123 4567' },
                { icon: <MapPin size={15} />, text: 'Bengaluru, Karnataka, India' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="text-[#6b5fff] flex-shrink-0">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                Get college updates in your inbox
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm bg-gray-50 dark:bg-[#0e0e20] border border-gray-200 dark:border-[#1c1c35] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b5fff]/30 focus:border-[#6b5fff]/50 transition-all"
                />
                <button className="flex-shrink-0 px-3 py-2.5 rounded-lg bg-[#6b5fff] text-white text-sm font-medium hover:bg-[#5b47f0] transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-gray-100 dark:border-[#1c1c35] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} CampusNavigator. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Made with</span>
            <span className="text-red-400">♥</span>
            <span>for Indian students</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link to="#" className="hover:text-[#6b5fff] transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-[#6b5fff] transition-colors">Terms</Link>
            <Link to="#" className="hover:text-[#6b5fff] transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
