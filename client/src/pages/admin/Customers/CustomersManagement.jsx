import { Search, Users, UserRoundCheck, UserPlus, Wallet, MapPin, CalendarDays, ChevronRight, } from "lucide-react";

import { useEffect, useState, } from "react";

import customerAdminService from "../../../services/customerAdmin.service";

const formatMoney = (value) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const formatDate = (value) => {
  return new Date(value).toLocaleDateString("vi-VN");
};

export default function CustomerManagement() {

   const currentYear = new Date().getFullYear();
    const [period, setPeriod] = useState("month");
    const [periodValue, setPeriodValue] = useState(
        String(new Date().getMonth() + 1)
    );
    const [year, setYear] = useState(currentYear);
      
    const [sort, setSort] = useState("visits_desc");

    const [search, setSearch] = useState("");

    const [customers, setCustomers] = useState([]);

    const [statistics, setStatistics] = useState({
        totalCustomers: 0,
        returningCustomers: 0,
        newCustomers: 0,
        totalSpent: 0,
    });

    const [selectedCustomer, setSelectedCustomer] =
        useState(null);

    const [loading, setLoading] = useState(false);


    // ==================================================
    // YEAR OPTIONS
    // ==================================================

    const yearOptions = Array.from(
        { length: 5 },
        (_, index) =>
            currentYear - index
    );


    // ==================================================
    // PERIOD OPTIONS
    // ==================================================

    const periodOptions =
        period === "month"
            ? Array.from(
                { length: 12 },
                (_, index) => ({
                    value: String(index + 1),
                    label: `Tháng ${index + 1}`,
                })
            )
            : period === "quarter"
            ? [1, 2, 3, 4].map(
                (quarter) => ({
                    value: String(quarter),
                    label: `Quý ${quarter}`,
                })
            )
            : yearOptions.map(
                (item) => ({
                    value: String(item),
                    label: `Năm ${item}`,
                })
            );

                // ==================================================
    // CHANGE PERIOD
    // ==================================================

    const handlePeriodChange = (newPeriod) => {

        setPeriod(newPeriod);

        if (newPeriod === "month") {

            setPeriodValue(
                String(
                    new Date().getMonth() + 1
                )
            );

            return;
        }

        if (newPeriod === "quarter") {

            const currentMonth =
                new Date().getMonth();

            const currentQuarter =
                Math.floor(
                    currentMonth / 3
                ) + 1;

            setPeriodValue(
                String(currentQuarter)
            );

            return;
        }

        // YEAR
        setPeriodValue(
            String(currentYear)
        );
    };
        // ==================================================
    // LOAD CUSTOMERS
    // ==================================================

    const loadCustomers = async () => {

    try {

        setLoading(true);

        const params = {
            period,
            year: Number(year),
            search,
            sort,
        };

        if (period !== "year") {
            params.value =
                Number(periodValue);
        }

        const result =
            await customerAdminService.getAll(
                params
            );

        const data =
            result.data || {};

        setCustomers(
            data.customers || []
        );

        setStatistics(
            data.statistics || {
                totalCustomers: 0,
                returningCustomers: 0,
                newCustomers: 0,
                totalSpent: 0,
            }
        );

    } catch (error) {

        console.error(
            "Không thể lấy danh sách khách hàng:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Không thể tải dữ liệu khách hàng."
        );

    } finally {

        setLoading(false);

    }
};
  
    // LOAD KHI ĐỔI KỲ
    useEffect(() => {

    const timer =
        setTimeout(() => {
            loadCustomers();
        }, 300);

    return () =>
        clearTimeout(timer);

}, [
    period,
    year,
    periodValue,
    sort,
    search,
]);

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Quản lý khách hàng
          </h1>

          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Theo dõi hành vi quay lại và thói quen sử dụng dịch vụ
          </p>
        </div>

        {/* FILTERS */}

<div className="flex flex-wrap items-center gap-2">

    {/* NĂM */}

    {period !== "year" && (

        <select
            value={year}
            onChange={(e) =>
                setYear(e.target.value)
            }
            className={`
                h-10
                rounded-xl
                border border-slate-200
                bg-white
                px-3
                text-sm
                text-[var(--color-text)]
                outline-none
                focus:border-[#4f7d4f]
            `}
        >

            {yearOptions.map((item) => (

                <option
                    key={item}
                    value={item}
                >
                    {item}
                </option>

            ))}

        </select>

    )}


    {/* THÁNG / QUÝ */}

    <select
        value={periodValue}
        onChange={(e) =>
            setPeriodValue(e.target.value)
        }
        className={`
            h-10
            rounded-xl
            border border-slate-200
            bg-white
            px-3
            text-sm
            text-[var(--color-text)]
            outline-none
            focus:border-[#4f7d4f]
        `}
    >

        {periodOptions.map((item) => (

            <option
                key={item.value}
                value={item.value}
            >
                {period === "year"
                    ? item.label
                    : `${item.label}/${year}`}
            </option>

        ))}

    </select>

    <div className="flex rounded-xl bg-white p-1 shadow-sm">

        {[
            ["month", "Tháng"],
            ["quarter", "Quý"],
            ["year", "Năm"],
        ].map(([value, label]) => (

            <button
                key={value}
                type="button"
                onClick={() =>
                    handlePeriodChange(value)
                }
                className={`
                    rounded-lg
                    px-4 py-2
                    text-sm font-medium
                    transition
                    ${
                        period === value
                            ? "bg-[var(--color-primary)] text-white"
                            : "text-[var(--color-text-muted)] hover:bg-[var(--color-secondary)]"
                    }
                `}
            >
                {label}
            </button>

        ))}

    </div>


    {/* SẮP XẾP */}

    <select
        value={sort}
        onChange={(e) =>
            setSort(e.target.value)
        }
        className={`
            h-10
            rounded-xl
            border border-slate-200
            bg-white
            px-3
            text-sm
            text-[var(--color-text)]
            outline-none
            focus:border-[#4f7d4f]
        `}
    >

        <option value="visits_desc">
            Ghé nhiều nhất
        </option>

        <option value="visits_asc">
            Ghé ít nhất
        </option>

        <option value="spent_desc">
            Chi tiêu cao nhất
        </option>

        <option value="spent_asc">
            Chi tiêu thấp nhất
        </option>

        <option value="last_visit_desc">
            Ghé gần nhất
        </option>

    </select>

</div>

      </div>


      {/* STATISTICS */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
            icon={<Users size={21} />}
            title="Tổng khách hàng"
            value={statistics.totalCustomers}
            description="Trong khoảng thời gian"
        />

        <StatCard
            icon={<UserRoundCheck size={21} />}
            title="Khách quay lại"
            value={statistics.returningCustomers}
            description="Đã ghé từ 2 lần"
        />

        <StatCard
            icon={<UserPlus size={21} />}
            title="Khách mới"
            value={statistics.newCustomers}
            description="Lần đầu ghé quán"
        />

        <StatCard
            icon={<Wallet size={21} />}
            title="Tổng chi tiêu"
            value={formatMoney(statistics.totalSpent)}
            description="Tổng giá trị đơn hàng"
        />

      </div>


      {/* CONTENT */}

      <div className="rounded-2xl bg-white shadow-sm">

        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="font-semibold text-[var(--color-text)]">
              Danh sách khách hàng
            </h2>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Theo dõi số lần ghé và cơ sở khách hàng thường sử dụng
            </p>
          </div>


          {/* SEARCH */}

          <div className="relative w-full lg:w-80">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, SĐT hoặc email..."
              className={`
                h-10 w-full rounded-xl
                border border-slate-200
                bg-slate-50 pl-10 pr-4
                text-sm outline-none
                transition
                focus:border-[#4f7d4f]
                focus:bg-white
              `}
            />

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-[var(--color-text)]">
                  Khách hàng
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-[var(--color-text)]">
                  Liên hệ
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-[var(--color-text)]">
                  Số lần ghé
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-[var(--color-text)]">
                  Cơ sở thường ghé
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-[var(--color-text)]">
                  Tổng chi tiêu
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-[var(--color-text)]">
                  Lần gần nhất
                </th>

                <th className="w-12 px-3" />

              </tr>
            </thead>


            <tbody>
              {loading ? (
                      <tr>
                          <td
                              colSpan={7}
                              className="px-5 py-12 text-center text-sm text-[var(--color-text)]"
                          >
                              Đang tải dữ liệu khách hàng...
                          </td>
                      </tr>
                  ) :
                (customers.map((customer) => (

                    <tr
                        key={customer.id}
                        onClick={() =>
                            setSelectedCustomer(customer)
                        }
                        className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50`}
                    >
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className=" flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)] font-semibold text-[var(--color-primary)]"
                                >
                                    {customer.name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text)]">
                                        {customer.name}
                                    </p>
                                    
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                            <p className="text-sm  text-[var(--color-text)]">
                                {customer.phone || "—"}
                            </p>

                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                {customer.email || "—"}
                            </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                            <span
                                className=" inline-flex items-center rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm font-semibold text-[var(--color-primary)]"
                            >
                                {customer.visits} lần
                            </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                            <div className="flex items-center gap-2">
                                <MapPin
                                    size={16}
                                    className="text-[var-(--color-primary)]"
                                />

                                <span className="text-sm text-[var(--color-text)]">
                                    {customer.favoriteBranch || "—"}
                                </span>
                            </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                            <span className="text-sm font-semibold text-[var(--color-text)]">
                                {formatMoney(customer.totalSpent)}
                            </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                            <div
                                className=" flex items-center justify-end gap-2 text-sm text-[var(--color-text-muted)] "
                            >
                                <CalendarDays size={15} />
                                {customer.lastVisit
                                    ? formatDate(customer.lastVisit)
                                    : "—"}
                            </div>
                        </td>
                        <td className="px-3">
                            <ChevronRight
                                size={18}
                                className="text-[var(--color-text-muted)]"
                            />
                        </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* EMPTY */}
        {!loading && customers.length === 0 && (
    <div className="py-16 text-center">
        <Users
            size={40}
            className="mx-auto text-slate-300"
        />

        <p className="mt-3 font-medium text-[var(--color-text-muted)]">
            Không tìm thấy khách hàng
        </p>

        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Thử tìm kiếm bằng tên, số điện thoại hoặc email
        </p>
    </div>
)}
        
      </div>
      {/* DETAIL */}
      {selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
/* ======================================================
   STAT CARD
====================================================== */
function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
            {value}
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>
        <div className={`
          flex h-10 w-10
          items-center justify-center
          rounded-xl
          bg-[var(--color-secondary)]
          text-[var(--color-primary)]
        `}>
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ======================================================
   DETAIL
====================================================== */

function CustomerDetail({
  customer,
  onClose,
}) {

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40 p-4
      `}
      onClick={onClose}
    >

      <div
        className={`
          max-h-[90vh]
          w-full max-w-3xl
          overflow-y-auto
          rounded-3xl
          bg-white
          shadow-xl
        `}
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}

        <div className="border-b border-slate-100 p-6">

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-4">

              <div className={`
                flex h-14 w-14
                items-center justify-center
                rounded-full
                bg-[var(--color-secondary)]
                text-xl font-bold
                text-[var(--color-priamry)]
              `}>
                {customer.name.charAt(0)}
              </div>

              <div>

                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  {customer.name}
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {customer.phone}
                </p>

              </div>

            </div>

            <button
              onClick={onClose}
              className={`
                rounded-xl px-3 py-2
                text-[var(--color-text-muted)]
                hover:bg-slate-100
              `}
            >
              Đóng
            </button>
          </div>
        </div>
        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
          <DetailStat
            label="Số lần ghé"
            value={`${customer.visits} lần`}
          />

          <DetailStat
            label="Tổng chi tiêu"
            value={formatMoney(customer.totalSpent)}
          />

          <DetailStat
            label="Cơ sở yêu thích"
            value={customer.favoriteBranch}
          />
        </div>

        {/* BRANCH */}
        <div className="px-6 pb-6">
          <h3 className="mb-4 font-semibold text-[var(--color-text)]">
            Thống kê theo cơ sở
          </h3>
          <div className="space-y-3">

            {(customer.branches || [])
              .slice()
              .sort((a, b) => b.visits - a.visits)
              .map((branch) => (
                <div
                  key={branch.branchId}
                  className=" rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className=" flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-secondary)] text-[var(--color-primary)]">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text)]">
                          {branch.branchName}
                        </p>

                        <p className="text-xs text-[var(--color-text-muted)]">
                          {branch.visits} lần ghé
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold text-[var(--color-text)]">
                      {formatMoney(customer.totalSpent)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function DetailStat({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-2 font-semibold text-[var(--color-text)]">
        {value}
      </p>
    </div>
  );
}