import './PublicFooter.css'

function PublicFooter({ logo, footerGroups }) {
  return (
    <footer className="public-footer">
      <div className="footer-brand">
        <img src={logo} alt="" />
        <div>
          <strong>Kendy Digital</strong>
          <p>Mua tài khoản Facebook, nâng cấp CapCut Pro, đăng ký dịch vụ quảng cáo và nhận hỗ trợ sau mua.</p>
        </div>
      </div>

      <div className="footer-links">
        {footerGroups.map((group) => (
          <div key={group.title}>
            <strong>{group.title}</strong>
            {group.links.map((link) => (
              <a href="#top" key={link}>
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>Liên hệ: Zalo/Facebook hỗ trợ sau khi đăng nhập</span>
        <span>Kendy Digital © 2026</span>
      </div>
    </footer>
  )
}

export default PublicFooter
