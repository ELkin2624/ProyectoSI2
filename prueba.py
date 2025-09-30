import cv2
import face_recognition

# ------------------------------
# Cargar imagen de referencia
# ------------------------------
image_path = r"C:\Imagenes\compa.jpg"
image = cv2.imread(image_path)

if image is None:
    print(f"No se pudo cargar la imagen: {image_path}")
    exit()

# Detectar la cara y obtener su encoding
face_locations = face_recognition.face_locations(image)
if not face_locations:
    print("No se detectó ninguna cara en la imagen de referencia.")
    exit()

face_encoding = face_recognition.face_encodings(image, known_face_locations=[face_locations[0]])[0]
print("Encoding de la imagen de referencia obtenido correctamente.")

# ------------------------------
# Configurar webcam
# ------------------------------
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
if not cap.isOpened():
    print("No se pudo abrir la cámara")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error al capturar el frame")
        break

    frame = cv2.flip(frame, 1)  # espejo

    # Detectar caras en el frame
    face_locations = face_recognition.face_locations(frame, model="hog")  # "hog" más rápido
    for face_location in face_locations:
        encodings = face_recognition.face_encodings(frame, known_face_locations=[face_location])
        if not encodings:
            continue
        face_frame_encoding = encodings[0]

        # Comparar con la imagen de referencia
        result = face_recognition.compare_faces([face_encoding], face_frame_encoding)
        if result[0]:
            text = "coincide"
            color = (125, 220, 0)
        else:
            text = "Desconocido"
            color = (50, 50, 255)

        # Dibujar rectángulo alrededor de la cara
        top, right, bottom, left = face_location
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
        cv2.rectangle(frame, (left, bottom), (right, bottom + 30), color, -1)
        cv2.putText(frame, text, (left, bottom + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)

    cv2.imshow("Webcam", frame)
    k = cv2.waitKey(1)
    if k & 0xFF == 27:  # Esc para salir
        break

cap.release()
cv2.destroyAllWindows()
