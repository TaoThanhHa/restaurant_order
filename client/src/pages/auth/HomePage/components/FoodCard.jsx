import { Clock3, Plus } from "lucide-react";

export default function FoodCard({ food }) {
  return (
    <article className="food-card">
      <div className="food-card__image">
        <img src={food.image} alt={food.name} />
      </div>
      <div className="food-card__body">
        <div className="food-card__heading">
          <h3>{food.name}</h3>
          <strong>{food.price}</strong>
        </div>
      </div>
    </article>
  );
}