function getValue(obj, key) {
  if (!key) return "";
  if (!obj) return "";
  return key.split(".").reduce((acc, part) => {
    return acc && acc[part] !== undefined ? acc[part] : "";
  }, obj);
}


export default function Table({ columns = [], data = [], actions }) {
  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-white border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left p-3 font-medium whitespace-nowrap"
                >
                  {col.title}
                </th>
              ))}
              {actions && (
                <th className="p-3 font-medium whitespace-nowrap">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="p-6 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="p-3 whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(getValue(row, col.key), row, idx)
                        : getValue(row, col.key)}
                    </td>
                  ))}
                  {actions && <td className="p-3">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}