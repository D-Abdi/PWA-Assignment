const offlineMessage = document.querySelector("offlineMessage");
const highlights = document.querySelector("highlights");
const highlightsRadio = document.querySelectorAll(
  'input[name="highlightPage"]',
);
const projectRadio = document.querySelectorAll('input[name="projectsPage"]');
const projects = document.querySelector("projects");
const tags = document.querySelector("tags");

window.addEventListener("load", (event) => {
  updateHighlights();
  updateProjects(1);
  updateTags();

  if ("serviceWorker" in navigator) {
    try {
      navigator.serviceWorker.register("sw.js");
      console.log("Service worker registered!");
    } catch (error) {
      console.log("Error: ", error);
    }
  }
});

window.addEventListener("online", (event) => {
  console.log(event, "You are now connected to the network.");
  offlineMessage.innerHTML = ``;
});

window.addEventListener("offline", (event) => {
  offlineMessage.innerHTML = `<div id="navbar">
    <h5>The page is offline...</h5>
  </div>`;
  console.log(event, "You are now disconnected to the network.");
});

function saveDataToDB(data) {
  localforage.setDriver([localforage.INDEXEDDB]).then(function () {
    data.map((item, index) => {
      localforage.setItem("Projects-" + index, item.project, function () {});

      localforage.setItem("Links-" + index, item.links, function () {});
    });
  });
}

// Student spotlight
async function updateHighlights(pageNumber = 1) {
  let offset = pageNumber * 2 - 2;
  let chunk = offset + 2;
  const res = await fetch("https://cmgt.hr.nl/api/projects");
  const json = await res.json();
  saveDataToDB(json.data);
  let highlightsArray = [];

  json.data.map((item) => {
    if (item.project.spotlight == 1) {
      highlightsArray.push(item);
    }
  });

  highlightsArray = highlightsArray.slice(offset, chunk);

  highlights.innerHTML = highlightsArray.map(createProjectCard).join("\n");
}

// Paginate projects
highlightsRadio.forEach((radio) => {
  radio.addEventListener("click", function () {
    const radioVal = radio.value;
    updateHighlights(radioVal);
  });
});

// Projects
async function updateProjects(pageNumber = 1) {
  const res = await fetch(`https://cmgt.hr.nl/api/projects?page=${pageNumber}`);
  const json = await res.json();

  projects.innerHTML = json.data.map(createProjectCard).join("\n");
}

// Paginate projects
projectRadio.forEach((radio) => {
  radio.addEventListener("click", function () {
    const radioVal = radio.value;
    updateProjects(radioVal);
  });
});

// Tags
async function updateTags() {
  const res = await fetch("https://cmgt.hr.nl/api/tags");
  const json = await res.json();

  tags.innerHTML = `${json.data.map(createTags).join("\n")}`;
}

function createProjectCard(item) {
  return `
  <div
  class="col-12 col-sm-12 col-md-6 mt-5"
>
    <div class="card">
    <img src="${
      item.project.screenshots[0]
    }" class="card-img-top" alt="..." style="height: 165px;">
    <div class="card-body">
      <h5 class="card-title">${item.project.title}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${item.project.tagline}</h6>
      ${item.project.tags
        .map((tag) => {
          return `<span class="badge rounded-pill bg-danger d-inline-block me-1">${tag.name}</span>`;
        })
        .join("")}
    </div>
  </div>
  </div>
    `;
}

function createTags(item) {
  return `
  <a class="no-text-decoration cursor-pointer badge rounded-pill bg-white text-red py-1 px-2 my-1 d-inline-block me-2 text-danger">${item.name}</a>
  `;
}
