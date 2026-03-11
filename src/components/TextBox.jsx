function TextBox({ label, type, id, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
        <label
            htmlFor={id}
            className="text-slate-700 text-sm font-semibold"
        >{label}</label>
        <input
            className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            type={type}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required
        />
    </div>
  )
}

export default TextBox
