export default function HomePage() {
  return (
    <div>
      <div className="home-hero">
        <h1>LotBidGo</h1>
        <p>Система учёта аукционных торгов для антикварных изделий и произведений искусства.</p>
      </div>

      <div className="home-features">
        <div className="home-feature">
          <h3>Каталог</h3>
          <p>Просмотр аукционов и лотов без регистрации</p>
        </div>
        <div className="home-feature">
          <h3>Покупатели</h3>
          <p>Ставки, история и список покупок</p>
        </div>
        <div className="home-feature">
          <h3>Продавцы</h3>
          <p>Свои лоты, выручка, отзыв до торгов</p>
        </div>
        <div className="home-feature">
          <h3>Администратор</h3>
          <p>Аукционы, лоты, продажи, аналитика</p>
        </div>
        <div className="home-feature">
          <h3>Экспорт</h3>
          <p>Выгрузка таблиц в Excel</p>
        </div>
        <div className="home-feature">
          <h3>Форматы</h3>
          <p>Очный, онлайн, гибридный</p>
        </div>
      </div>
    </div>
  );
}