import { Link } from "react-router-dom";
import { CourseDetail } from "@/components/courses/courseDetailsData";

interface Props {
  detail: CourseDetail;
}

// Шаблонные отзывы из courseDetailsData не показываем: они не подтверждены
// реальными учениками (38-ФЗ «О рекламе»). Реальные отзывы — на /reviews.
export default function CourseDetailReviews(_props: Props) {
  return (
    <div className="animate-fade-in">
      <p className="text-white/60 text-sm mb-3">
        Курс только что вышел — отзывы появятся после первых выпускников.
      </p>
      <Link to="/reviews" className="text-purple-300 hover:text-purple-200 text-sm underline underline-offset-2">
        Все отзывы об УЧИСЬПРО
      </Link>
    </div>
  );
}