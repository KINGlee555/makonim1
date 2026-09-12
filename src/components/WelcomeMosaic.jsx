const TILES = [
  "https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/209439/pexels-photo-209439.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/1391489/pexels-photo-1391489.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/2893635/pexels-photo-2893635.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/9012381/pexels-photo-9012381.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/1591939/pexels-photo-1591939.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=300",
  "https://images.pexels.com/photos/4109944/pexels-photo-4109944.jpeg?auto=compress&cs=tinysrgb&w=300",
];

// Tiles hidden behind the centered logo band, keeping an air gap around it
const HIDDEN = [5, 6];

export default function WelcomeMosaic() {
  return (
    <div className="absolute inset-x-0 top-0 h-[58vh] min-h-[300px] overflow-hidden bg-[#0F3D3E]">
      <div className="grid grid-cols-4 gap-2 p-2">
        {TILES.map((src, i) => (
          <div key={src} className="aspect-square overflow-hidden rounded-2xl bg-[#124546]">
            {!HIDDEN.includes(i) && (
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 top-[27%] flex items-center justify-center gap-3">
        <img
          src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/77de857b8_generated_image.png"
          alt="MaKonim"
          className="h-14 w-auto object-contain drop-shadow-lg"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0F3D3E] to-transparent" />
    </div>
  );
}