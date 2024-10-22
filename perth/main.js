const SUPABASE_URL = 'https://jlczxwwoujhzvdwmcucp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsY3p4d3dvdWpoenZkd21jdWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5MTEzNDgsImV4cCI6MjA0NDQ4NzM0OH0.xQ_EDCcsxso91JXY4-E3BeAdwliTnxRPmnQ5PWZHu4k';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SUPABASE_DB ='perth_business';
const LOCATION ='perth';
const capitalizedLocation = LOCATION.charAt(0).toUpperCase() + LOCATION.slice(1)

const heading = document.querySelector('.container h1');

heading.textContent = `${capitalizedLocation} Business Finder v1.6`;
// Fetch recent 10 businesses
async function fetchRecentBusinesses() {
    let {data: businesses, error} = await supabaseClient
        .from(SUPABASE_DB)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    if (error) {
        console.error('Error fetching recent businesses:', error);
    } else {
        renderBusinessList(businesses);
    }
}

// Function to fetch available categories and populate the dropdown
async function fetchCategories() {
    let { data: categories, error } = await supabaseClient
        .rpc(`${LOCATION}_businesses_by_category`);

    if (error) {
        console.error('Error fetching categories:', error);
    } else {
        const categoryFilter = document.getElementById('category-filter');
        const businessCategory = document.getElementById('business-category');

        // Clear existing options
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        businessCategory.innerHTML = '<option value="" disabled selected>Select Category</option>';

        // Populate category filter
        categories.forEach(item => {
            let filterOption = document.createElement('option');
            filterOption.value = item.category;
            filterOption.textContent = item.category;
            categoryFilter.appendChild(filterOption);
        });

        // Populate business form category dropdown
        categories.forEach(item => {
            let businessOption = document.createElement('option');
            businessOption.value = item.category;
            businessOption.textContent = item.category;
            businessCategory.appendChild(businessOption);
        });
    }
}

// Show Image Carousel when clicking on the thumbnail
// Show Image Carousel in Modal
function showImageCarousel(imageUrls) {

    // Show the modal
    const modal = document.getElementById('image-carousel-modal');
    modal.style.display = 'flex';

    const carouselWrapper = document.getElementById('carousel-slides');
    carouselWrapper.innerHTML = ''; // Clear previous images

    // Add new slides for each image
    imageUrls.forEach(url => {
        const { data } = supabaseClient.storage.from('business-images').getPublicUrl(url);
        const imgUrl = data.publicUrl; // Get the public URL
        const slide = `
            <div class="swiper-slide">
                <img src="${imgUrl}" alt="Business Image">
            </div>
        `;
        carouselWrapper.innerHTML += slide;
    });

    // Initialize or update Swiper
    if (!window.mySwiper) {
        window.mySwiper = new Swiper('.img-modal-swiper-container', {
            loop: imageUrls.length >= 3,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 3000,
            },
            slidesPerView: 1,
            spaceBetween: 10,
        });
    } else {
        window.mySwiper.update(); // Update swiper if already initialized
    }


}

// Close the Image Carousel Modal when clicking outside the content
window.onclick = function (event) {
    const imageModal = document.getElementById('image-carousel-modal');

};

// Close the modal when the close button is clicked
document.getElementById('close-image-modal').onclick = function () {
    const modal = document.getElementById('image-carousel-modal');
    modal.style.display = 'none';
};



// Close the Add Business Modal
document.getElementById('close-add-business-modal').onclick = function () {
    const modal = document.getElementById('add-business-modal');
    modal.style.display = 'none';
};

// Also close the modal when clicking outside the content
window.onclick = function (event) {
    const imageModal = document.getElementById('image-carousel-modal');
    const addBusinessModal = document.getElementById('add-business-modal');

    if (event.target == imageModal) {
        imageModal.style.display = 'none';
    }

    if (event.target == addBusinessModal) {
        addBusinessModal.style.display = 'none';
    }
};


// Search businesses as user types in the search bar
async function searchBusinesses() {
    const query = document.getElementById('search-input').value.toLowerCase();
    let {data: businesses, error} = await supabaseClient
        .from(SUPABASE_DB)
        .select('*')
        .ilike('name', `%${query}%`)
    ;
    if (error) {
        console.error('Error searching businesses:', error);
    } else {
        renderBusinessList(businesses);
    }
}

// Filter businesses by category
async function filterByCategory() {
    const category = document.getElementById('category-filter').value;

    let businesses;
    if (category === 'all') {
        // If 'All Categories' is selected, fetch all businesses
        let { data, error } = await supabaseClient
            .from(SUPABASE_DB)
            .select('*');
        if (error) {
            console.error('Error fetching all businesses:', error);
            return;
        }
        businesses = data;
    } else {
        // Otherwise, fetch businesses filtered by the selected category
        let { data, error } = await supabaseClient
            .from(SUPABASE_DB)
            .select('*')
            .eq('category', category);
        if (error) {
            console.error('Error filtering by category:', error);
            return;
        }
        businesses = data;
    }

    // Render the filtered businesses (or all businesses)
    renderBusinessList(businesses);
}

function getMapsLink(address) {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        // For Android devices
        return `geo:0,0?q=${encodeURIComponent(address)}`;
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        // For iOS devices
        return `comgooglemaps://?q=${encodeURIComponent(address)}`;
    } else {
        // Fallback for other devices (use web version)
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
}

// Render business list
async function renderBusinessList(businesses) {
    const businessList = document.getElementById('business-list');
    businessList.innerHTML = '';

    for (const business of businesses) {
        const mapsLink = getMapsLink(business.address); // Get the appropriate link for the address
        let imageThumbnails = ''; // Initialize an empty string to hold the images

        // If there are multiple images, loop through the array and render them
        if (business.image_urls && business.image_urls.length > 0) {
            for (const image_url of business.image_urls) {
                const { data } = supabaseClient.storage.from('business-images').getPublicUrl(image_url);
                const url = data.publicUrl; // Get the public URL
                imageThumbnails += `<img src="${url}" alt="Business Thumbnail" style="max-width:50px;max-height:50px; cursor:pointer" onclick='showImageCarousel(${JSON.stringify(business.image_urls)})'>`;
            }
        }

        const businessCard = `
            <div class="business-card">
                <div class="category-label" onclick="filterByCategory('${business.category}')">
                    ${business.category}
                </div>
                <h2>${business.name}</h2>
                <p>
                    <a class="map-link" href="${mapsLink}" target="_blank">
                        ${business.address}
                    </a>
                </p>
                <p><a class="phone-link" href="tel:${business.phone}">${business.phone}</a></p>
                <div class="opening-hours">
                    <p><strong>Opening Hours:</strong> ${business.opening_hours}</p>
                </div>
                <div class="business-thumbnails">
                    ${imageThumbnails} <!-- Display all image thumbnails here -->
                </div>
            </div>
        `;

        businessList.innerHTML += businessCard;
    }
}


// Fetch businesses and categories on page load
fetchRecentBusinesses();
fetchCategories();

// Modal functionality
const modal = document.getElementById('add-business-modal');
const addBusinessBtn = document.getElementById('add-business-btn');

addBusinessBtn.onclick = function () {
    modal.style.display = 'flex';
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

async function uploadSingleImage(imageFile) {
    const sanitizedFileName = imageFile.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');

    const { data, error } = await supabaseClient
        .storage
        .from('business-images')
        .upload(`${Date.now()}_${sanitizedFileName}`, imageFile, {
            cacheControl: '3600',
            upsert: false
        });
    if (error) {
        console.error('Error uploading image:', error);
        return null;
    } else {
        console.log('Image uploaded successfully:', data.path);
        return data.path; // Return the uploaded image key (URL)
    }
}

// Insert new business into Supabase
document.getElementById('add-business-form')
    .addEventListener('submit', async function (event) {
    event.preventDefault();
    const name = document.getElementById('business-name').value;
    let category = document.getElementById('business-category').value;
    const newCategory = document.getElementById('new-category').value;

    const address = document.getElementById('business-address').value;
    const phone = document.getElementById('business-phone').value;
    const opening_hours = document.getElementById('business-hours').value;
    const imageFiles = document.getElementById('business-image').files;

    if(newCategory){
        category=newCategory;
    }
    if(!newCategory && !category) {
        category='Etc';
    }
    let imageUrls = [];
    // Loop through all selected files and upload them
    if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
            const imageFile = imageFiles[i];
            const imageKey = await uploadSingleImage(imageFile); // Upload each image
            if (imageKey) {
                imageUrls.push(imageKey); // Push the returned key to the imageUrls array
            }
        }
    }
    let {data, error} = await supabaseClient.from(SUPABASE_DB).insert([{
        name,
        category,
        address,
        phone,
        opening_hours,
        image_urls: imageUrls  // Store array of image URLs
    }]);

    if (error) {
        console.error('Error adding business:', error);
    } else {
        modal.style.display = 'none';  // Close the modal
        fetchRecentBusinesses();  // Refresh the business list
    }
});

