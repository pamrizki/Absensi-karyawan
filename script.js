//Konfigurasi Utama
const webAppUrl = 'https://script.google.com/macros/s/AKfycbzjzeOU7T91FmF018l4WcOlvL1Lz_jRov29uqR070aixEsMx5szZ1t__RX5uP_5_FFN/exec'; // Ganti dengan URL Deploy terbaru
const rfidInput = document.getElementById('rfid-input');
const statusBox = document.getElementById('status-box');
const loader = document.getElementById('loader');


// Fungsi Jam Digital
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').innerText = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock(); // 
// 2.  Memuat Tabel 
async function loadAttendance() {
    try {
        const response = await fetch(webAppUrl + '?action=read');
        const data = await response.json();
        
        const tbody = document.getElementById('attendance-body');
        if (!tbody) return;
        
        tbody.innerHTML = ''; 

        // Ambil 10 data terbaru dan tampilkan di tabel
        data.reverse().slice(0, 10).forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.waktu}</td>
                <td>${row.nama}</td>
                <td>${row.departemen}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.log("Tabel riwayat belum ada data atau gagal dimuat.");
    }
}

// 3. Fungsi Utama Proses Absensi
async function prosesAbsensi(idKartu) {
    loader.style.display = 'block';
    statusBox.style.display = 'none';
    
    // 
    const urlApi = `${webAppUrl}?nomor_kartu=${idKartu}&action=absensi`;

    try {
        const response = await fetch(urlApi);
        const result = await response.json();
        
        if (result.status === "success") {
            tampilkanStatus(result.pesan, 'success');
        } else if (result.status === "warning") {
            tampilkanStatus(result.pesan, 'warning'); // Notif "Sudah Daftar"
        } else {
            tampilkanStatus(result.pesan, 'error');   // Notif "Data Tidak Valid"
        }
        
        // 
        loadAttendance();

    } catch (error) {
        console.error("Error Fetch:", error);
        tampilkanStatus('Gagal terhubung ke server.', 'error');
    } finally {
        loader.style.display = 'none';
    }
}

// 4. Fungsi untuk Menampilkan Notifikasi
function tampilkanStatus(pesan, tipe) {
    statusBox.innerText = pesan;
    statusBox.style.display = 'block';
    
    // Reset class alert
    statusBox.className = 'alert status-message w-100 mt-3';

    if (tipe === 'success') {
        statusBox.classList.add('alert-success');
    } else if (tipe === 'warning') {
        statusBox.classList.add('alert-warning');
    } else {
        statusBox.classList.add('alert-danger');
    }
    
    setTimeout(() => {
        statusBox.style.display = 'none';
    }, 4000);
}

// 5. Event Listeners & Inisialisasi
document.addEventListener('click', () => rfidInput.focus());

rfidInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        let cardNumber = rfidInput.value.replace(/^0+/, ''); // Hapus 00 di depan
        rfidInput.value = ''; 
        if (cardNumber !== "") {
            prosesAbsensi(cardNumber);
        }
    }
});

// Jalankan saat pertama kali web dibuka
setInterval(loadAttendance, 5000)
loadAttendance();