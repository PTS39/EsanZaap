let userLocation, watchId, capturedImage; // ประกาศตัวแปรสำหรับตำแหน่งผู้ใช้, การติดตามตำแหน่ง และรูปที่ถ่าย
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const cameraContainer = document.getElementById('cameraContainer');
const mapContainer = document.getElementById('mapContainer');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const savePhotoBtn = document.getElementById('savePhotoBtn');
const cancelCameraBtn = document.getElementById('cancelCameraBtn');
const saveTimeBtn = document.getElementById('saveTimeBtn');
const cancelMapBtn = document.getElementById('cancelMapBtn');
const clockInBtn = document.getElementById('clockInBtn');
const clockOutBtn = document.getElementById('clockOutBtn');

// ฟังก์ชันเริ่มต้นกล้อง
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            alert("ไม่สามารถเข้าถึงกล้องได้: " + err.message);
        });
}

// ฟังก์ชันปิดกล้อง
function stopCamera() {
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => track.stop());
    video.srcObject = null;
}

// ฟังก์ชันถ่ายรูป
function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImage = canvas.toDataURL('image/png');
    photo.src = capturedImage;
    photo.style.display = 'block';
    video.style.display = 'none'; // ซ่อนกล้อง
    canvas.style.display = 'none'; // ซ่อน canvas
    captureBtn.classList.add('hidden');
    retakeBtn.classList.remove('hidden');
    savePhotoBtn.classList.remove('hidden');
}

// ฟังก์ชันอัพเดตแผนที่ด้วยตำแหน่งของผู้ใช้
function updateMap(position) {
    const { latitude, longitude, accuracy, speed } = position.coords;
    userLocation = { lat: latitude, lng: longitude };

    // ตรวจสอบตำแหน่งปลอม
    if (position.mocked || accuracy > 50 || speed === 0) {
        alert("พบความผิดปกติในการใช้งานตำแหน่ง โปรดใช้ GPS จริงเท่านั้น");
        stopTracking();
        return;
    }

    const mapFrame = document.getElementById('map');
    mapFrame.src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
}

// ฟังก์ชันจัดการข้อผิดพลาด
function handleError(error) {
    alert(`เกิดข้อผิดพลาด: ${error.message}`);
}

// ฟังก์ชันเริ่มติดตามตำแหน่ง
function startTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            updateMap,
            handleError,
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            }
        );
    } else {
        alert("เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่ง");
    }
}

// ฟังก์ชันหยุดติดตามตำแหน่ง
function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

// ฟังก์ชันตรวจสอบว่าผู้ใช้อยู่ในพื้นที่บริษัทหรือไม่
function checkIfInCompany(location) {
    const companyBounds = {
        north: 13.7593,
        south: 13.7563,
        east: 100.5048,
        west: 100.5018
    };

    return (
        location.lat <= companyBounds.north &&
        location.lat >= companyBounds.south &&
        location.lng <= companyBounds.east &&
        location.lng >= companyBounds.west
    );
}

// ฟังก์ชันบันทึกข้อมูล
function saveData(data) {
    // จำลองการบันทึกข้อมูล
    console.log("Saving data:", data);
    // แจ้งเตือนการบันทึกสำเร็จ
    alert("บันทึกข้อมูลเรียบร้อยแล้ว");
}

// จัดการการคลิกปุ่มเข้างานหรือออกงาน
function handleClock(action) {
    // ซ่อนปุ่มเข้างานและออกงาน
    clockInBtn.classList.add('hidden');
    clockOutBtn.classList.add('hidden');
    
    cameraContainer.classList.remove('hidden');
    mapContainer.classList.add('hidden');
    startCamera();

    // ตั้งค่าปุ่มเมื่อเริ่มเปิดกล้อง
    captureBtn.classList.remove('hidden');
    retakeBtn.classList.add('hidden');
    savePhotoBtn.classList.add('hidden');

    // กดถ่ายรูป
    captureBtn.addEventListener('click', capturePhoto);

    // กดถ่ายรูปใหม่
    retakeBtn.addEventListener('click', () => {
        photo.style.display = 'none';
        video.style.display = 'block'; // แสดงกล้อง
        canvas.style.display = 'block'; // แสดง canvas
        captureBtn.classList.remove('hidden');
        retakeBtn.classList.add('hidden');
        savePhotoBtn.classList.add('hidden');
    });

    // กดบันทึกรูป
    savePhotoBtn.addEventListener('click', () => {
        stopCamera();
        cameraContainer.classList.add('hidden');
        mapContainer.classList.remove('hidden');
        startTracking();
    });

    // ยกเลิกการถ่ายรูป
    cancelCameraBtn.addEventListener('click', () => {
        stopCamera();
        cameraContainer.classList.add('hidden');
        clockInBtn.classList.remove('hidden');
        clockOutBtn.classList.remove('hidden');
    });

    // กดบันทึกเวลา
    saveTimeBtn.addEventListener('click', () => {
        stopTracking();
        const data = {
            action: action,
            timestamp: new Date().toISOString(),
            location: userLocation,
            inCompany: checkIfInCompany(userLocation),
            photo: capturedImage
        };
        saveData(data);
    });

    // ยกเลิกการบันทึกเวลา
    cancelMapBtn.addEventListener('click', () => {
        stopTracking();
        mapContainer.classList.add('hidden');
        clockInBtn.classList.remove('hidden');
        clockOutBtn.classList.remove('hidden');
    });
}

// ตั้งค่า Event Listener สำหรับปุ่มเข้างานและออกงาน
document.getElementById('clockInBtn').addEventListener('click', () => {
    handleClock("Clock In");
});

document.getElementById('clockOutBtn').addEventListener('click', () => {
    handleClock("Clock Out");
});
