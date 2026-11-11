export default function GlassFilterDefs() {
  return (
    <svg className="hi-glass-filter-defs" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="hi-glass-edge-refraction" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.035" numOctaves="1" seed="9" result="glassNoise" />
          <feDisplacementMap in="SourceGraphic" in2="glassNoise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
