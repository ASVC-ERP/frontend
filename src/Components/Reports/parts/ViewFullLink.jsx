import { Link } from "react-router-dom";

// Small header link on a dashboard panel that opens its full detail page,
// carrying the current date range.
export default function ViewFullLink({ report, panel, range }) {
  return (
    <Link
      to={`/reports/${report}/${panel}?from=${range.from}&to=${range.to}`}
      className="report-viewfull"
    >
      View full →
    </Link>
  );
}
