function PublicFooter({ logo, footerGroups }) {
  return (
    <footer className="public-footer">
      <div className="footer-brand">
        <img src={logo} alt="" />
        <div>
          <strong>Kendy Digital</strong>
          <p>Nền tảng dịch vụ số tự động, nạp tiền nhanh, quản lý đơn minh bạch.</p>
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
        <span>Liên hệ: support@kendy.digital</span>
        <span>Kendy Digital © 2026</span>
      </div>
    </footer>
  )
}

export default PublicFooter
