export default function FloorTabs({
    floors = [],
    active,
    onChange,
}) {

    return (
        <div className="flex gap-3 flex-wrap">
            {
                floors.map(floor => (
                    <button
                        key={floor.id}
                        onClick={() => onChange(floor.id)}
                        className={`
                            px-5
                            py-2
                            rounded-lg
                            transition
                            ${
                                active === floor.id
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "bg-white border hover:bg-[var(--color-secondary-hover)]"
                            }
                        `}
                    >
                        Tầng {floor.floorNumber}
                    </button>
                ))
            }
        </div>
    );
}