const places = [
  {
    id: 1,
    name: "Parkir Jalan Ijen",
    address: "Jalan Ijen, Malang",
    status: "retribusi",
    label: "RETRIBUSI PARKIR",

    ojol: "GRATIS",
    motor: "Rp2.000",
    mobil: "Rp3.000",

    lat: -7.9839,
    lng: 112.6214,

    source: "Belum diisi",
    verified: "Belum diisi",
    hours: "Belum diisi",
    note: "Informasi contoh untuk prototype."
  },
  {
    id: 2,
    name: "Parkir Area Usaha",
    address: "Contoh lokasi usaha, Malang",
    status: "pajak",
    label: "PAJAK PARKIR",

    ojol: "Sesuai pengelola",
    motor: "Sesuai pengelola",
    mobil: "Sesuai pengelola",

    lat: -7.9810,
    lng: 112.6250,

    source: "Belum diisi",
    verified: "Belum diisi",
    hours: "Belum diisi",
    note: "Informasi contoh untuk prototype."
  },
  {
    id: 3,
    name: "Parkir Jalan Contoh",
    address: "Contoh lokasi, Malang",
    status: "unknown",
    label: "BELUM TERVERIFIKASI",

    ojol: "Belum diketahui",
    motor: "Belum diketahui",
    mobil: "Belum diketahui",

    lat: -7.9860,
    lng: 112.6180,

    source: "Belum ada sumber cukup",
    verified: "Belum diisi",
    hours: "Belum diisi",
    note: "Belum dapat disimpulkan statusnya."
  }
];

let map, markers = [], activeFilter = "all";

function initMap(){
  map = L.map('map').setView([-7.9839,112.6214], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  render();
}
function markerColor(status){return status==="retribusi" ? "#2f8b59" : status==="pajak" ? "#356ca8" : "#7e8782";}
function render(){
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  let data = places.filter(p => (activeFilter==="all" || p.status===activeFilter) && (!q || (p.name+" "+p.address).toLowerCase().includes(q)));
  const sort = document.getElementById('sortSelect').value;
  if(sort==="name") data.sort((a,b)=>a.name.localeCompare(b.name));
  else data.sort((a,b)=>a.status.localeCompare(b.status));
  document.getElementById('resultText').textContent = data.length+" lokasi";
  const cards = document.getElementById('cards');
  cards.innerHTML = data.length ? data.map(cardHTML).join('') : '<div class="card"><b>Tidak ditemukan.</b><div class="address">Coba kata pencarian lain atau tampilkan semua.</div></div>';
  markers.forEach(m=>m.remove()); markers=[];
  data.forEach(p=>{
    const m=L.circleMarker([p.lat,p.lng],{radius:9,fillColor:markerColor(p.status),color:"#fff",weight:2,fillOpacity:1}).addTo(map);
    m.bindPopup(`<b>${p.name}</b><br>${p.label}<br>${p.price}`);
    markers.push(m);
  });
}
function cardHTML(p){
  return `<article class="card">
    <div class="card-top">
      <div>
        <h3>${p.name}</h3>
        <div class="address">📍 ${p.address}</div>
      </div>

      <span class="badge ${p.status}">${p.label}</span>
    </div>

    <div class="meta">
      <span>🛵 Ojol ${p.ojol}</span>
      <span>🏍️ Motor ${p.motor}</span>
      <span>🚗 Mobil ${p.mobil}</span>
    </div>

    <div class="card-actions">
      <button class="primary" onclick="focusPlace(${p.id})">
        Lihat di peta
      </button>

      <button onclick="showParkingDetail(${p.id})">
        Detail
      </button>

      <a href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}" target="_blank" rel="noopener">
        Navigasi ↗
      </a>

      <button onclick="openReport('${p.name.replace(/'/g,"\\'")}')">
        Laporkan
      </button>
    </div>
  </article>`;
}
function focusPlace(id){
  const p=places.find(x=>x.id===id); map.setView([p.lat,p.lng],16); 
}
document.getElementById('searchInput').addEventListener('input',render);
document.getElementById('sortSelect').addEventListener('change',render);
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  activeFilter=b.dataset.filter; render();
}));
function useLocation(){
  if(!navigator.geolocation){alert("Browser tidak mendukung lokasi.");return;}
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude,longitude}=pos.coords;
    map.setView([latitude,longitude],16);
    L.marker([latitude,longitude]).addTo(map).bindPopup("Lokasi kamu").openPopup();
  },()=>alert("Lokasi tidak dapat diakses. Pastikan izin lokasi diaktifkan."));
}
function openReport(location=""){document.getElementById('reportModal').classList.add('open');document.getElementById('reportModal').setAttribute('aria-hidden','false');document.getElementById('rLocation').value=location;}
function closeReport(){document.getElementById('reportModal').classList.remove('open');document.getElementById('reportModal').setAttribute('aria-hidden','true');}
function reportFromDetail(){
  const location = document
    .querySelector("#parkingDetail h2")
    .textContent
    .replace("📍 ", "");

  closeParkingDetail();
  openReport(location);
}
function submitReport(){
  const location = document.getElementById("rLocation").value;
  const price = document.getElementById("rPrice").value;
  const type = document.getElementById("rType").value;

  alert(
    "Laporan diterima sebagai simulasi.\n\n" +
    "Lokasi: " + location + "\n" +
    "Jenis laporan: " + type + "\n" +
    "Diminta bayar: " + (price || "Tidak diisi")
  );

  closeReport();
}
window.addEventListener('load',initMap);
function showParkingDetail(id) {
  const p = places.find(x => x.id === id);

  if (!p) return;

  document.querySelector("#parkingDetail h2").textContent = "📍 " + p.name;

  document.querySelector(".detail-status strong").textContent = p.label;

  const tariffBoxes = document.querySelectorAll(".detail-tariffs div");

  tariffBoxes[0].querySelector("strong").textContent = p.ojol;
  tariffBoxes[1].querySelector("strong").textContent = p.motor;
  tariffBoxes[2].querySelector("strong").textContent = p.mobil;

  document.querySelector(".detail-info").innerHTML = `
  <p><strong>Status:</strong> ${p.label}</p>
  <p><strong>Jam operasional:</strong> ${p.hours}</p>
  <p><strong>Sumber:</strong> ${p.source}</p>
  <p><strong>Terakhir diverifikasi:</strong> ${p.verified}</p>
  <p><strong>Catatan:</strong> ${p.note}</p>
`;

document.getElementById("detailNavigation").href =
  `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;

  document.getElementById("parkingDetail").style.display = "flex";
}