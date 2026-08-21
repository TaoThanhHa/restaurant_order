export default function ActionCard({
    icon,
    title,
    description,
    button,
    color,
    onClick,
}) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow">

            <div className="flex items-center gap-4">

                <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white ${color}`}
                >
                    {icon}
                </div>

                <div className="flex-1">
                    <h2 className="text-lg font-bold">
                        {title}
                    </h2>

                    <p className="text-sm text-gray-500">
                        {description}
                    </p>
                </div>

            </div>

            <button
                type="button"
                onClick={onClick}
                className={`mt-4 w-full rounded-xl py-3 font-semibold text-white ${color}`}
            >
                {button}
            </button>

        </div>
    );
}