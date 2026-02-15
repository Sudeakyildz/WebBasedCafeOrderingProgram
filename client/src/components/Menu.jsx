import { menuCategories } from '../data/menu'
import MenuItem from './MenuItem'

export default function Menu({ onAddToOrder }) {
  return (
    <section className="menu">
      <h2>Menü</h2>
      {menuCategories.map((category) => (
        <div key={category.id} className="menu-category">
          <h3>{category.name}</h3>
          {category.items.map((item) => (
            <MenuItem key={item.id} item={item} onAdd={onAddToOrder} />
          ))}
        </div>
      ))}
    </section>
  )
}
