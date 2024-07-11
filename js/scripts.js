// Espera a que el documento HTML esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Obtiene todos los enlaces de la barra de navegación
  const navLinks = document.querySelectorAll(".navbar ul li a");

  // Itera sobre cada enlace y agrega un evento de clic suave para desplazarse
  navLinks.forEach(function (navLink) {
    navLink.addEventListener("click", function (event) {
      event.preventDefault(); // Evita el comportamiento predeterminado del enlace

      // Obtiene el valor del atributo href del enlace clicado
      const targetId = this.getAttribute("href").substring(1); // Elimina el "#" del inicio

      // Encuentra el elemento con el id correspondiente en el documento
      const targetElement = document.getElementById(targetId);

      // Verifica si el elemento existe en el documento
      if (targetElement) {
        // Calcula la posición del elemento en relación con la parte superior de la página
        const targetPosition = targetElement.offsetTop;

        // Realiza un desplazamiento suave hasta la posición del elemento
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
});
