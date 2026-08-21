import { Check } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";

function AppearanceSection() {
    const {
        theme,
        setTheme,
        themes,
    } = useTheme();

    return (
        <section  className=" bg-white rounded-xl border border-[var(--color-border)] p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                    Giao diện
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Chọn giao diện cho quán
                </p>
            </div>

            <div className=" grid grid-cols-2 md:grid-cols-3 gap-4">

                {themes.map((item) => {

                    const active =
                        theme === item.id;

                    return (

                        <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                                setTheme(item.id)
                            }
                            className={`
                                relative
                                rounded-xl
                                border-2
                                p-4
                                text-left
                                transition
                                hover:-translate-y-1
                                ${
                                    active
                                        ? "border-[var(--color-primary)]"
                                        : "border-[var(--color-border)]"
                                }
                            `}
                        >

                            {active && (
                                <div className=" absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-white" >
                                    <Check size={15} />
                                </div>
                            )}


                            <div
                                className=" h-24 rounded-lg mb-4"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />


                            <h3
                                className="font-semibold"
                                style={{
                                    color: item.text,
                                }}
                            >
                                {item.name}
                            </h3>


                            <div className="flex gap-2 mt-3">

                                <span
                                    className=" w-6 h-6 rounded-full"
                                    style={{ backgroundColor: item.color, }}
                                />

                                <span
                                    className=" w-6 h-6 rounded-full"
                                    style={{ backgroundColor: item.secondary,}}
                                />

                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default AppearanceSection;