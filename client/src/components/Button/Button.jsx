export default function Button({
    children,
    className = "",
    ...props
}) {
    return (
        <button
            {...props}
            className={`mb-2 p-2 align-center rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] duration-300 font-medium ${className}`}
        >
            {children}
        </button>
    );
}
