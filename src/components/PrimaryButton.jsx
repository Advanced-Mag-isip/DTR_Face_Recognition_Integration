function PrimaryButton({ text, disabled, type = 'button' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full bg-primary text-white py-4 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-light active:scale-[0.98]'}`}
    >
        {text}
    </button>
  )
}

export default PrimaryButton
