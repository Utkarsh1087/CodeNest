import { ChangeEvent } from "react"
import { PiCaretDownBold } from "react-icons/pi"

interface SelectProps {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    value: string
    options: string[]
    title: string
}

function Select({ onChange, value, options, title }: SelectProps) {
    return (
        <div className="relative w-full flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/30 ml-1">
                {title}
            </label>
            <div className="relative group">
                <select
                    className="w-full appearance-none rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/80 outline-none transition-all hover:bg-white/10 hover:border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    value={value}
                    onChange={onChange}
                >
                    {options.sort().map((option) => {
                        const val = option
                        const name =
                            option.charAt(0).toUpperCase() + option.slice(1)

                        return (
                            <option key={name} value={val} className="bg-dark text-white">
                                {name}
                            </option>
                        )
                    })}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-hover:text-white/40">
                    <PiCaretDownBold size={14} />
                </div>
            </div>
        </div>
    )
}

export default Select
