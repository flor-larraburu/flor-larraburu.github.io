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
        const targetPosition = targetElement.offsetTop - 80; // Ajusta el desplazamiento para compensar la altura del header

        // Realiza un desplazamiento suave hasta la posición del elemento
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Manejador para la galería de fotos
  const categories = document.querySelectorAll(".photo-category");
  const gallery = document.getElementById("gallery");
  const photos = {
    naturaleza: ["foto1.jpg", "foto2.jpg", "foto3.jpg"],
    ciudad: ["foto4.jpg", "foto5.jpg", "foto6.jpg"],
    retratos: ["foto7.jpg", "foto8.jpg", "foto9.jpg"],
  };

  categories.forEach((category) => {
    category.addEventListener("click", function () {
      const selectedCategory = this.getAttribute("data-category");
      const images = photos[selectedCategory];
      gallery.innerHTML = "";
      images.forEach((img) => {
        const imgElement = document.createElement("img");
        imgElement.src = `path/to/${img}`;
        gallery.appendChild(imgElement);
      });
      gallery.style.display = "grid";
    });
  });

  // Manejador para la timeline
  var timelines = $(".cd-horizontal-timeline"),
    eventsMinDistance = 60;

  timelines.length > 0 && initTimeline(timelines);

  function initTimeline(timelines) {
    timelines.each(function () {
      var timeline = $(this),
        timelineComponents = {};
      //cache timeline components
      timelineComponents["timelineWrapper"] = timeline.find(".events-wrapper");
      timelineComponents["eventsWrapper"] =
        timelineComponents["timelineWrapper"].children(".events");
      timelineComponents["fillingLine"] =
        timelineComponents["eventsWrapper"].children(".filling-line");
      timelineComponents["timelineEvents"] =
        timelineComponents["eventsWrapper"].find("a");
      timelineComponents["timelineDates"] = parseDate(
        timelineComponents["timelineEvents"]
      );
      timelineComponents["eventsMinLapse"] = minLapse(
        timelineComponents["timelineDates"]
      );
      timelineComponents["timelineNavigation"] = timeline.find(
        ".cd-timeline-navigation"
      );
      timelineComponents["eventsContent"] =
        timeline.children(".events-content");

      //assign a left postion to the single events along the timeline
      setDatePosition(timelineComponents, eventsMinDistance);
      //assign a width to the timeline
      var timelineTotWidth = setTimelineWidth(
        timelineComponents,
        eventsMinDistance
      );
      //the timeline has been initialize - show it
      timeline.addClass("loaded");

      //detect click on the next arrow
      timelineComponents["timelineNavigation"].on(
        "click",
        ".next",
        function (event) {
          event.preventDefault();
          updateSlide(timelineComponents, timelineTotWidth, "next");
        }
      );
      //detect click on the prev arrow
      timelineComponents["timelineNavigation"].on(
        "click",
        ".prev",
        function (event) {
          event.preventDefault();
          updateSlide(timelineComponents, timelineTotWidth, "prev");
        }
      );
      //detect click on the a single event - show new event content
      timelineComponents["eventsWrapper"].on("click", "a", function (event) {
        event.preventDefault();
        timelineComponents["timelineEvents"].removeClass("selected");
        $(this).addClass("selected");
        updateOlderEvents($(this));
        updateFilling(
          $(this),
          timelineComponents["fillingLine"],
          timelineTotWidth
        );
        updateVisibleContent($(this), timelineComponents["eventsContent"]);
      });

      //on swipe, show next/prev event content
      timelineComponents["eventsContent"].on("swipeleft", function () {
        var mq = checkMQ();
        mq == "mobile" &&
          showNewContent(timelineComponents, timelineTotWidth, "next");
      });
      timelineComponents["eventsContent"].on("swiperight", function () {
        var mq = checkMQ();
        mq == "mobile" &&
          showNewContent(timelineComponents, timelineTotWidth, "prev");
      });

      //keyboard navigation
      $(document).keyup(function (event) {
        if (event.which == "37" && elementInViewport(timeline.get(0))) {
          showNewContent(timelineComponents, timelineTotWidth, "prev");
        } else if (event.which == "39" && elementInViewport(timeline.get(0))) {
          showNewContent(timelineComponents, timelineTotWidth, "next");
        }
      });
    });
  }

  function updateSlide(timelineComponents, timelineTotWidth, string) {
    //retrieve translateX value of timelineComponents['eventsWrapper']
    var translateValue = getTranslateValue(timelineComponents["eventsWrapper"]),
      wrapperWidth = Number(
        timelineComponents["timelineWrapper"].css("width").replace("px", "")
      );
    //translate the timeline to the left('next')/right('prev')
    string == "next"
      ? translateTimeline(
          timelineComponents,
          translateValue - wrapperWidth + eventsMinDistance,
          wrapperWidth - timelineTotWidth
        )
      : translateTimeline(
          timelineComponents,
          translateValue + wrapperWidth - eventsMinDistance
        );
  }

  function showNewContent(timelineComponents, timelineTotWidth, string) {
    //go from one event to the next/previous one
    var visibleContent = timelineComponents["eventsContent"].find(".selected"),
      newContent =
        string == "next" ? visibleContent.next() : visibleContent.prev();

    if (newContent.length > 0) {
      //if there's a next/prev event - show it
      var selectedDate = timelineComponents["eventsWrapper"].find(".selected"),
        newEvent =
          string == "next"
            ? selectedDate.parent("li").next("li").children("a")
            : selectedDate.parent("li").prev("li").children("a");

      updateFilling(
        newEvent,
        timelineComponents["fillingLine"],
        timelineTotWidth
      );
      updateVisibleContent(newEvent, timelineComponents["eventsContent"]);
      newEvent.addClass("selected");
      selectedDate.removeClass("selected");
      updateOlderEvents(newEvent);
      updateTimelinePosition(
        string,
        newEvent,
        timelineComponents,
        timelineTotWidth
      );
    }
  }

  function updateTimelinePosition(
    string,
    event,
    timelineComponents,
    timelineTotWidth
  ) {
    //translate timeline to the left/right according to the position of the selected event
    var eventStyle = window.getComputedStyle(event.get(0), null),
      eventLeft = Number(eventStyle.getPropertyValue("left").replace("px", "")),
      timelineWidth = Number(
        timelineComponents["timelineWrapper"].css("width").replace("px", "")
      ),
      timelineTotWidth = Number(
        timelineComponents["eventsWrapper"].css("width").replace("px", "")
      );
    var timelineTranslate = getTranslateValue(
      timelineComponents["eventsWrapper"]
    );

    if (
      (string == "next" && eventLeft > timelineWidth - timelineTranslate) ||
      (string == "prev" && eventLeft < -timelineTranslate)
    ) {
      translateTimeline(
        timelineComponents,
        -eventLeft + timelineWidth / 2,
        timelineWidth - timelineTotWidth
      );
    }
  }

  function translateTimeline(timelineComponents, value, totWidth) {
    var eventsWrapper = timelineComponents["eventsWrapper"].get(0);
    value = value > 0 ? 0 : value; //only negative translate value
    value =
      !(typeof totWidth === "undefined") && value < totWidth ? totWidth : value; //do not translate more than timeline width
    setTransformValue(eventsWrapper, "translateX", value + "px");
    //update navigation arrows visibility
    value == 0
      ? timelineComponents["timelineNavigation"]
          .find(".prev")
          .addClass("inactive")
      : timelineComponents["timelineNavigation"]
          .find(".prev")
          .removeClass("inactive");
    value == totWidth
      ? timelineComponents["timelineNavigation"]
          .find(".next")
          .addClass("inactive")
      : timelineComponents["timelineNavigation"]
          .find(".next")
          .removeClass("inactive");
  }

  function updateFilling(selectedEvent, filling, totWidth) {
    //change .filling-line length according to the selected event
    var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
      eventLeft = eventStyle.getPropertyValue("left"),
      eventWidth = eventStyle.getPropertyValue("width");
    eventLeft =
      Number(eventLeft.replace("px", "")) +
      Number(eventWidth.replace("px", "")) / 2;
    var scaleValue = eventLeft / totWidth;
    setTransformValue(filling.get(0), "scaleX", scaleValue);
  }

  function setDatePosition(timelineComponents, min) {
    for (i = 0; i < timelineComponents["timelineDates"].length; i++) {
      var distance = daydiff(
          timelineComponents["timelineDates"][0],
          timelineComponents["timelineDates"][i]
        ),
        distanceNorm =
          Math.round(distance / timelineComponents["eventsMinLapse"]) + 2;
      timelineComponents["timelineEvents"]
        .eq(i)
        .css("left", distanceNorm * min + "px");
    }
  }

  function setTimelineWidth(timelineComponents, width) {
    var timeSpan = daydiff(
        timelineComponents["timelineDates"][0],
        timelineComponents["timelineDates"][
          timelineComponents["timelineDates"].length - 1
        ]
      ),
      timeSpanNorm = timeSpan / timelineComponents["eventsMinLapse"],
      timeSpanNorm = Math.round(timeSpanNorm) + 4,
      totalWidth = timeSpanNorm * width;
    timelineComponents["eventsWrapper"].css("width", totalWidth + "px");
    updateFilling(
      timelineComponents["timelineEvents"].eq(0),
      timelineComponents["fillingLine"],
      totalWidth
    );

    return totalWidth;
  }

  function updateVisibleContent(event, eventsContent) {
    var eventDate = event.data("date"),
      visibleContent = eventsContent.find(".selected"),
      selectedContent = eventsContent.find('[data-date="' + eventDate + '"]'),
      selectedContentHeight = selectedContent.height();

    if (selectedContent.index() > visibleContent.index()) {
      var classEntering = "selected enter-right",
        classLeaving = "leave-left";
    } else {
      var classEntering = "selected enter-left",
        classLeaving = "leave-right";
    }

    selectedContent.attr("class", classEntering);
    visibleContent
      .attr("class", classLeaving)
      .one(
        "webkitAnimationEnd oanimationend msAnimationEnd animationend",
        function () {
          visibleContent.removeClass("leave-right leave-left");
          selectedContent.removeClass("enter-left enter-right");
        }
      );
    eventsContent.css("height", selectedContentHeight + "px");
  }

  function updateOlderEvents(event) {
    event
      .parent("li")
      .prevAll("li")
      .children("a")
      .addClass("older-event")
      .end()
      .end()
      .nextAll("li")
      .children("a")
      .removeClass("older-event");
  }

  function getTranslateValue(timeline) {
    var timelineStyle = window.getComputedStyle(timeline.get(0), null),
      timelineTranslate =
        timelineStyle.getPropertyValue("-webkit-transform") ||
        timelineStyle.getPropertyValue("-moz-transform") ||
        timelineStyle.getPropertyValue("-ms-transform") ||
        timelineStyle.getPropertyValue("-o-transform") ||
        timelineStyle.getPropertyValue("transform");

    if (timelineTranslate.indexOf("(") >= 0) {
      var timelineTranslate = timelineTranslate.split("(")[1];
      timelineTranslate = timelineTranslate.split(")")[0];
      timelineTranslate = timelineTranslate.split(",");
      var translateValue = timelineTranslate[4];
    } else {
      var translateValue = 0;
    }

    return Number(translateValue);
  }

  function setTransformValue(element, property, value) {
    element.style["-webkit-transform"] = property + "(" + value + ")";
    element.style["-moz-transform"] = property + "(" + value + ")";
    element.style["-ms-transform"] = property + "(" + value + ")";
    element.style["-o-transform"] = property + "(" + value + ")";
    element.style["transform"] = property + "(" + value + ")";
  }

  //based on http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
  function parseDate(events) {
    var dateArrays = [];
    events.each(function () {
      var dateComp = $(this).data("date").split("/"),
        newDate = new Date(dateComp[2], dateComp[1] - 1, dateComp[0]);
      dateArrays.push(newDate);
    });
    return dateArrays;
  }

  function daydiff(first, second) {
    return Math.round(second - first);
  }

  function minLapse(dates) {
    //determine the minimum distance among events
    var dateDistances = [];
    for (i = 1; i < dates.length; i++) {
      var distance = daydiff(dates[i - 1], dates[i]);
      dateDistances.push(distance);
    }
    return Math.min.apply(null, dateDistances);
  }

  /*
    How to tell if a DOM element is visible in the current viewport?
    http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
  */
  function elementInViewport(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while (el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return (
      top < window.pageYOffset + window.innerHeight &&
      left < window.pageXOffset + window.innerWidth &&
      top + height > window.pageYOffset &&
      left + width > window.pageXOffset
    );
  }
  // Obtener el modal
  var modal = document.getElementById("pdfModal");

  // Obtener el botón para abrir el modal
  var btnOpenModal = document.getElementById("openModal");

  // Obtener el elemento span para cerrar el modal
  var spanClose = document.getElementsByClassName("close")[0];

  // Cuando el usuario haga clic en el enlace, abrir el modal
  btnOpenModal.onclick = function () {
    modal.style.display = "block";
  };

  // Cuando el usuario haga clic en la 'x', cerrar el modal
  spanClose.onclick = function () {
    modal.style.display = "none";
  };

  // Cuando el usuario haga clic fuera del modal, cerrarlo
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    // JavaScript adicional puede ir aquí si es necesario
  });

  function checkMQ() {
    //check if mobile or desktop device
    return window
      .getComputedStyle(
        document.querySelector(".cd-horizontal-timeline"),
        "::before"
      )
      .getPropertyValue("content")
      .replace(/'/g, "")
      .replace(/"/g, "");
  }
});
