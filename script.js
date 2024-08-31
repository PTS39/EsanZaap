let userLocation, watchId; // ประกาศตัวแปรตำแหน่งผู้ใช้ และตัวแปรสำหรับการติดตามตำแหน่ง
const video = document.getElementById('video'); // ตัวแปรสำหรับวิดีโอจากกล้อง
const canvas = document.getElementById('canvas'); // ตัวแปรสำหรับแคนวาส
const photo = document.getElementById('photo'); // ตัวแปรสำหรับแสดงรูปถ่าย

// ฟังก์ชันเริ่มต้นกล้อง
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }) // ขอสิทธิ์ใช้กล้อง
        .then(stream => {
            video.srcObject = stream; // แสดงภาพจากกล้องบน video element
        })
        .catch(err => {
            alert("ไม่สามารถเข้าถึงกล้องได้: " + err.message); // แจ้งเตือนเมื่อไม่สามารถใช้กล้องได้
        });
}

// ฟังก์ชันถ่ายรูป
function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height); // จับภาพจากกล้องใส่ canvas
    const imageDataUrl = canvas.toDataURL('image/png'); // แปลงภาพเป็น Base64
    photo.src = imageDataUrl; // ตั้งค่า src ให้กับ image element
    photo.style.display = 'block'; // แสดงรูปที่ถ่าย
    return imageDataUrl; // คืนค่ารูปที่ถ่าย
}

// อัพเดต iframe ของแผนที่ด้วยตำแหน่งของผู้ใช้
function updateMap(position) {
    const { latitude, longitude, accuracy, speed } = position.coords; // ดึงข้อมูลตำแหน่งจาก GPS
    userLocation = { lat: latitude, lng: longitude }; // บันทึกตำแหน่งปัจจุบันของผู้ใช้

    // ตรวจสอบว่าตำแหน่งเป็นของปลอมหรือไม่ (ตรวจจับ Mock Location)
    if (position.mocked || accuracy > 50 || speed === 0) {
        alert("พบความผิดปกติในการใช้งานตำแหน่ง โปรดใช้ GPS จริงเท่านั้น"); // แจ้งเตือนหากพบตำแหน่งปลอม
        stopTracking(); // หยุดติดตามตำแหน่ง
        return;
    }

    // อัพเดต src ของ iframe เพื่อแสดงตำแหน่งบนแผนที่ Google Maps
    const mapFrame = document.getElementById('map');
    mapFrame.src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
}

// ฟังก์ชันจัดการข้อผิดพลาดเมื่อไม่สามารถดึงตำแหน่งได้
function handleError(error) {
    alert(`เกิดข้อผิดพลาด: ${error.message}`); // แสดงข้อความข้อผิดพลาด
}

// เริ่มต้นการติดตามตำแหน่งของผู้ใช้
function startTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            updateMap,
            handleError,
            {
                enableHighAccuracy: true, // บังคับให้ใช้ GPS ที่มีความแม่นยำสูง
                maximumAge: 0, // ไม่ใช้ตำแหน่งที่ถูกแคชไว้
                timeout: 10000 // กำหนดเวลารอ 10 วินาที
            }
        );
    } else {
        alert("เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่ง"); // แจ้งเตือนถ้าเบราว์เซอร์ไม่รองรับ
    }
}

// หยุดการติดตามตำแหน่งของผู้ใช้
function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId); // หยุดการติดตามตำแหน่ง
        watchId = null;
    }
}

// ฟังก์ชันถ่ายรูปและบันทึกข้อมูล
function capturePhotoAndSave(action) {
    const photoData = capturePhoto(); // ถ่ายรูปและเก็บรูปที่ถ่าย

    // เริ่มต้นการติดตามตำแหน่งผู้ใช้
    startTracking();

    // หลังจากได้ตำแหน่งแล้ว ให้บันทึกข้อมูลไปยัง Google Sheets หรือฐานข้อมูล
    const data = {
        action: action, // บันทึกการเข้างานหรือออกงาน
        timestamp: new Date().toISOString(), // เวลาที่บันทึก
        location: userLocation, // ตำแหน่งที่ได้จาก GPS
        inCompany: checkIfInCompany(userLocation), // ตรวจสอบว่าผู้ใช้ในพื้นที่บริษัทหรือไม่
        photo: photoData // บันทึกรูปที่ถ่าย
    };

    // เรียก API หรือ Google Apps Script เพื่อบันทึกข้อมูล
    saveData(data);
}

// ฟังก์ชันตรวจสอบว่าผู้ใช้อยู่ในพื้นที่บริษัทหรือไม่
function checkIfInCompany(location) {
    const companyBounds = {
        // กำหนดขอบเขตของบริษัท (ตัวอย่าง)
        north: 13.7593,
        south: 13.7563,
        east: 100.5048,
        west: 100.5018
    };

    // ตรวจสอบว่าตำแหน่งอยู่ในขอบเขตที่กำหนด
    return (
        location.lat <= companyBounds.north &&
        location.lat >= companyBounds.south &&
        location.lng <= companyBounds.east &&
        location.lng >= companyBounds.west
    );
}

// ฟังก์ชันบันทึกข้อมูล (เรียกใช้ API หรือ Google Apps Script)
function saveData(data) {
    console.log("Saving data:", data); // ล็อกข้อมูลที่บันทึก
    // ส่วนนี้คุณสามารถส่งข้อมูลไปยัง backend หรือ Google Apps Script
}

// ตั้งค่า Event Listener ให้ปุ่มเข้างาน
document.getElementById("clockInBtn").addEventListener("click", () => {
    capturePhotoAndSave("Clock In");
});

// ตั้งค่า Event Listener ให้ปุ่มออกงาน
document.getElementById("clockOutBtn").addEventListener("click", () => {
    capturePhotoAndSave("Clock Out");
});

// เรียกฟังก์ชันเริ่มต้นกล้องเมื่อเริ่มโหลดหน้า
window.onload = startCamera;
