import { Link } from "react-router-dom";

// Small header link on a dashboard panel that opens its full detail page,
// carrying the current date range. Pass `to` directly to point somewhere
// other than the generic /reports/:report/:panel list (e.g. the dedicated
// Customer Report page).
export default function ViewFullLink({ report, panel, range, to }) {
  const href = to ?? `/reports/${report}/${panel}?from=${range.from}&to=${range.to}`;
  return (
    <Link to={href} className="report-viewfull">
      View full →
    </Link>
  );
}
