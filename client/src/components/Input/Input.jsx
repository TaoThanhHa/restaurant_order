export default function Input({
    icon,
    className = "",
    ...props
}) {
    return (
        <div className={`flex items-center h-14 rounded-xl border bg-white/20 px-4 ${className}`}>
            {icon}
            <input
                {...props}
                className=" ml-3 flex-1 bg-transparent outline-none"
            />
        </div>
    );
}