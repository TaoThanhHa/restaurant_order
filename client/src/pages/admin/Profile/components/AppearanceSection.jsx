import { Check } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";
import adminService from "../../../../services/admin.service";

function AppearanceSection() {
    const { theme, setTheme, themes } = useTheme();

    const handleThemeChange = async (themeId) => {
        try {
            await adminService.updateRestaurant({
                theme: themeId,
            });

            setTheme(themeId);
        } catch (error) {
            console.error("UPDATE THEME ERROR:", error);
        }
    };

    return (
        <section className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                    Giao diện
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Chọn giao diện cho quán
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {themes.map((item) => {
                    const active = theme === item.id;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleThemeChange(item.id)}
                            className={`relative rounded-xl border-2 p-4 text-left transition hover:-translate-y-1 ${
                                active
                                    ? "border-[var(--color-primary)]"
                                    : "border-[var(--color-border)]"
                            }`}
                        >
                            {active && (
                                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                                    <Check size={15} />
                                </div>
                            )}

                            <div
                                className="mb-4 h-24 rounded-lg"
                                style={{ backgroundColor: item.color }}
                            />

                            <h3
                                className="font-semibold"
                                style={{ color: item.text }}
                            >
                                {item.name}
                            </h3>

                            <div className="mt-3 flex gap-2">
                                <span
                                    className="h-6 w-6 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />

                                <span
                                    className="h-6 w-6 rounded-full"
                                    style={{ backgroundColor: item.secondary }}
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
