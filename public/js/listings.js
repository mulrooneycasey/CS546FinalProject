const inputIds = {
    description: '#descriptionInput',
    image: '#imageInput',
    location: '#locationInput',
    keyword: '#keywordInput'
};

$(document).ready(function() {
    // If the button that opens the modal is not disabled, then add additional functionalities.
    if (!$('button[data-toggle=modal]').attr('disabled')) {
        let postArea = $('#post-area');

        // Add an event listener to the "Choose file" input that listens for changes and updates 
        // the label with the current filename.
        var fileInput = $('#imageInput'), fileInputLabel = $('.custom-file-label');
        fileInput.on('change', () => {
            let fileObj = $(fileInput).prop('files');
            if (!fileObj || fileObj.length < 1)
                return;
            else {
                let filename = fileObj[0].name;
                fileInputLabel.text(filename);
            }
        });

        // Clear out all of the values for each input in the form when the modal is shown.
        $('#createPostModal').on('shown.bs.modal', () => {
            for (let key in inputIds) {
                // If we're dealing with the image input, change its label to the default text.
                if (inputIds[key] === '#imageInput')
                    fileInputLabel.text('Choose file');
                // Else, just clear them out.
                else
                    $(inputIds[key]).val('');
            }
            // Lastly, focus on the 'Description' input.
            $(inputIds.description).trigger('focus');
        });

        // Add an event listener to the "Create a Post" form that listens for clicks.
        let createPostForm = $('#createPostModal');
        createPostForm.submit(evt => {
            evt.preventDefault();
            console.group(`'Create a Post' Modal:`);
            console.log('Hello World!');

            // Create variables to hold all of the relevant form inputs.
            let descriptionVal = $('#descriptionInput').val(),
                imageVal = fileInputLabel.val(),
                locationVal = $('#locationInput').val(),
                keywordVal = $('#keywordInput').val().split('; '),
                placedSightedVal = $('#placedSightedSelect').val();
            
            // Use AJAX to a make POST request using the data in the form.
            let requestConfig = {
                method: 'POST',
                url: document.location.pathname,
                contentType: 'application/json',
                data: JSON.stringify({
                    description: descriptionVal,
                    image: imageVal,
                    location: locationVal,
                    keywords: keywordVal,
                    placedSighted: placedSightedVal
                })
            };
            // Update the page with the 10 most recent posts using AJAX and dismiss the modal.
            $.ajax(requestConfig)
                .done(res => {
                    console.log('Updating the page with the new post & the 9 other most recent posts.');
                    // Remove the last post on the page.
                    postArea.last().remove();
                    console.log(res);
                    // Add the new post to the page.
                    let newElem = $(res);
                    postArea.append(newElem);
                })
                .fail(err => {
                    console.error(`POST to '${document.location.pathname}' failed:`);
                    console.log(err);
                })
                .always(() => {
                    console.log('Closing modal...');
                    $('#createPostModal').modal('hide');
                });
            console.groupEnd();
        });
    }
});