interface SwitchProps {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
}

 const Switch = ({ checked, onChange, label, description }: SwitchProps) => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "10px 14px",
                background: "white",
                borderRadius: "14px",
                border: "1px solid var(--outline-variant)",
            }}
        >
            <div>
                <div
                    style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#1C1B1F",
                    }}
                >
                    {label}
                </div>
                {description && (
                    <div
                        style={{
                            fontSize: "11px",
                            color: "var(--secondary)",
                            marginTop: "2px",
                        }}
                    >
                        {description}
                    </div>
                )}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                style={{
                    position: "relative",
                    width: "44px",
                    height: "24px",
                    borderRadius: "100px",
                    background: checked
                        ? "var(--primary)"
                        : "var(--outline-variant)",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    flexShrink: 0,
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        top: "3px",
                        left: checked ? "23px" : "3px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "white",
                        transition: "left 0.2s ease-in-out",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                />
            </button>
        </div>
    );
}
export default Switch;