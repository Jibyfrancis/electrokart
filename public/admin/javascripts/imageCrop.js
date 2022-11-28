
        
const input = document.getElementById('id_image')
const test = document.getElementById('test')
input.addEventListener('change', () => {
    // Getting image file object from the input variable
    const img_data = []
    const imagebox = []
    const crop_btn = []
    const confirm_btn = []
    const url = []
    const length = input.files.length
    for (i = 0; i < length; i++) {
        test.innerHTML += `<div class="col-4"><div id="image-box${i}" class="image-container" style="height: 350px; width: 350px;"> </div>
<button class="btn btn-outline-info" id="crop-btn${i}" style="width: 100%; margin-top: 10px; display: block;" type="button">Crop</button> </div>`
    }
    for (i = 0; i < length; i++) {
        img_data[i] = input.files[i]
    }

    img_data.forEach((image_data, i) => {
        url[i] = URL.createObjectURL(image_data)
    })
    // createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
    // The new object URL represents the specified File object or Blob object.
    url.forEach((url, i) => {
        document.getElementById('image-box' + i).innerHTML = `<img src="${url}" id="image${i}" style="width:100%;">`
    })

    // Creating a image tag inside imagebox which will hold the cropping view image(uploaded file) to it using the url created before.

    // Storing that cropping view image in a variable


    // Displaying the image box
    for (i = 0; i < length; i++) {
        document.getElementById('image-box' + i).style.display = 'block'
        document.getElementById('crop-btn' + i).style.display = 'block'
    }


    for (i = 0; i < length; i++) {
        cropper(img_data[i], document.getElementById('image' + i), i, document.getElementById('crop-btn' + i), document.getElementById('image-box' + i))
    }



    // Creating a croper object with the cropping view image
    // The new Cropper() method will do all the magic and diplay the cropping view and adding cropping functionality on the website
    // For more settings, check out their official documentation at https://github.com/fengyuanchen/cropperjs
    let container = new DataTransfer();
    let fileInputElement = document.getElementById('id_image');



    function cropper(img_data, image, index, crop_btn, imagebox) {

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            minCropBoxWidth: 50,
            minCropBoxHeight: 50,
        })

        // When crop button is clicked this event will get triggered
        crop_btn.addEventListener('click', () => {
            // This method coverts the selected cropped image on the cropper canvas into a blob object
            cropper.getCroppedCanvas().toBlob((blob) => {

                // Gets the original image data
                // Make a new cropped image file using that blob object, image_data.name will make the new file name same as original image
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                // Create a new container

                // Add the cropped image file to the container
                container.items.add(file);

                fileInputElement.files = container.files

                // Replace the original image file with the new cropped image file



                // Hide the cropper box
                imagebox.style.display = 'none'
                // Hide the crop button
                crop_btn.style.display = 'none'
            });
        });
    }
   });
