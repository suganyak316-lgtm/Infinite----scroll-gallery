const ACCESS_KEY = "G11mpnKiHKUmHEyQOkenHgXY3XZoc8IL8fxlYi-EfSI";

const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const sentinel = document.getElementById("sentinel");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

const photographer = document.getElementById("photographer");
const photoDimensions = document.getElementById("photoDimensions");
const likes = document.getElementById("likes");
const downloadBtn = document.getElementById("downloadBtn");

const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const errorContainer = document.getElementById("errorContainer");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");

const emptyState = document.getElementById("emptyState");

const skeletonContainer = document.getElementById("skeletonContainer");

const collectionButtons =
  document.querySelectorAll(".collection-btn");

const scrollTopBtn =
  document.getElementById("scrollTopBtn");

let page = 1;
let loading = false;
let exhausted = false;
let query = "";

let photos = [];
let currentIndex = 0;

/* ---------------------- */
/* URL STATE */
/* ---------------------- */

function updateURL() {

    const url = new URL(window.location);

    if(query){
        url.searchParams.set("q", query);
    }else{
        url.searchParams.delete("q");
    }

    history.pushState({}, "", url);
}

function loadQueryFromURL(){

    const params =
        new URLSearchParams(window.location.search);

    const q = params.get("q");

    if(q){

        query = q;
        searchInput.value = q;

    }
}

/* ---------------------- */
/* FETCH PHOTOS */
/* ---------------------- */

async function fetchPhotos(){

    if(loading || exhausted) return;

    loading = true;

    skeletonContainer.style.display = "block";

    errorContainer.style.display = "none";

    try{

        let url;

        if(query){

            url =
            `https://api.unsplash.com/search/photos?page=${page}&per_page=20&query=${encodeURIComponent(query)}&client_id=${ACCESS_KEY}`;

        }else{

            url =
            `https://api.unsplash.com/photos?page=${page}&per_page=20&client_id=${ACCESS_KEY}`;

        }

        const response = await fetch(url);

        if(!response.ok){

            throw new Error(
                `HTTP Error ${response.status}`
            );
        }

        const data = await response.json();

        const imageData =
            query ? data.results : data;

        if(imageData.length === 0){

            if(page === 1){

                emptyState.style.display = "block";
            }

            exhausted = true;

            return;
        }

        emptyState.style.display = "none";

        photos.push(...imageData);

        renderPhotos(imageData);

        page++;

    }
    catch(error){

        console.error(error);

        errorContainer.style.display = "block";

        errorMessage.textContent =
            "Failed to load photos. Check API key or internet.";

    }
    finally{

        loading = false;

        skeletonContainer.style.display = "none";
    }
}

/* ---------------------- */
/* RENDER PHOTOS */
/* ---------------------- */

function renderPhotos(images){

    images.forEach(photo=>{

        const card =
            document.createElement("div");

        card.className = "gallery-item";

        card.innerHTML = `

            <img
                src="${photo.urls.small}"
                alt="${photo.alt_description || 'Photo'}"
                loading="lazy"
                decoding="async"
            >

            <div class="image-info">

                <p>
                    <strong>${photo.user.name}</strong>
                </p>

            </div>

        `;

        const img = card.querySelector("img");

        img.addEventListener("load",()=>{

            img.classList.add("loaded");

        });

        card.addEventListener("click",()=>{

            currentIndex =
                photos.indexOf(photo);

            openLightbox();

        });

        gallery.appendChild(card);

    });

}

/* ---------------------- */
/* LIGHTBOX */
/* ---------------------- */

function openLightbox(){

    const photo =
        photos[currentIndex];

    lightbox.classList.add("active");

    lightboxImg.src =
        photo.urls.regular;

    photographer.textContent =
        photo.user.name;

    photoDimensions.textContent =
        `${photo.width} × ${photo.height}`;

    likes.textContent =
        `❤ ${photo.likes} Likes`;

    downloadBtn.href =
        photo.links.download;

}

function closeLightbox(){

    lightbox.classList.remove("active");

}

function nextImage(){

    if(currentIndex <
        photos.length - 1){

        currentIndex++;

        openLightbox();

    }

}

function previousImage(){

    if(currentIndex > 0){

        currentIndex--;

        openLightbox();

    }

}

closeBtn.addEventListener(
    "click",
    closeLightbox
);

nextBtn.addEventListener(
    "click",
    nextImage
);

prevBtn.addEventListener(
    "click",
    previousImage
);

document.addEventListener(
    "keydown",
    (e)=>{

        if(
            !lightbox.classList.contains("active")
        ) return;

        if(e.key === "Escape"){

            closeLightbox();

        }

        if(e.key === "ArrowRight"){

            nextImage();

        }

        if(e.key === "ArrowLeft"){

            previousImage();

        }

    }
);

/* ---------------------- */
/* SEARCH */
/* ---------------------- */

let debounceTimer;

searchInput.addEventListener(
    "input",
    ()=>{

        clearTimeout(debounceTimer);

        debounceTimer =
        setTimeout(()=>{

            query =
                searchInput.value.trim();

            page = 1;

            exhausted = false;

            photos = [];

            gallery.innerHTML = "";

            updateURL();

            fetchPhotos();

        },400);

    }
);

/* ---------------------- */
/* COLLECTIONS */
/* ---------------------- */

collectionButtons.forEach(btn=>{

    btn.addEventListener(
        "click",
        ()=>{

            collectionButtons.forEach(
                b=>b.classList.remove("active")
            );

            btn.classList.add("active");

            query =
                btn.dataset.query;

            searchInput.value = query;

            page = 1;

            exhausted = false;

            photos = [];

            gallery.innerHTML = "";

            updateURL();

            fetchPhotos();

        }
    );

});

/* ---------------------- */
/* RETRY */
/* ---------------------- */

retryBtn.addEventListener(
    "click",
    ()=>{

        fetchPhotos();

    }
);

/* ---------------------- */
/* INFINITE SCROLL */
/* ---------------------- */

const observer =
new IntersectionObserver(

    entries=>{

        if(
            entries[0].isIntersecting
        ){

            fetchPhotos();

        }

    },

    {
        rootMargin:"300px"
    }

);

observer.observe(sentinel);

/* ---------------------- */
/* SCROLL TOP */
/* ---------------------- */

window.addEventListener(
    "scroll",
    ()=>{

        if(window.scrollY > 500){

            scrollTopBtn.style.display =
                "block";

        }else{

            scrollTopBtn.style.display =
                "none";

        }

    }
);

scrollTopBtn.addEventListener(
    "click",
    ()=>{

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    }
);

/* ---------------------- */
/* INITIAL LOAD */
/* ---------------------- */

loadQueryFromURL();

fetchPhotos();
