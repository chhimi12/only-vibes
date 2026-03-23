document.addEventListener('DOMContentLoaded', () => {
    const rsvpForm = document.getElementById('rsvp-form');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');
    const foodListContainer = document.getElementById('food-list-container');

    // Load RSVPs on page load
    fetchRsvps();

    // Handle form submission
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable button and show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Gather data
        const rsvpData = {
            name: document.getElementById('name').value.trim(),
            student_id: document.getElementById('student-id').value.trim(),
            food: document.getElementById('food').value.trim(),
            dietary_restrictions: document.getElementById('dietary-restrictions').value.trim()
        };

        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rsvpData)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('RSVP Successful! Thanks for signing up.', 'success');
                rsvpForm.reset();
                fetchRsvps(); // Refresh the list
            } else {
                showMessage(result.error || 'Failed to submit RSVP.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showMessage('Network error. Please try again.', 'error');
        } finally {
            // Restore button
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Function to fetch and display RSVPs
    async function fetchRsvps() {
        try {
            const response = await fetch('/api/rsvps');
            if (!response.ok) {
                throw new Error('Failed to fetch RSVPs');
            }
            
            const rsvps = await response.json();
            renderFoodList(rsvps);
        } catch (error) {
            console.error('Error fetching RSVPs:', error);
            foodListContainer.innerHTML = '<p class="error">Failed to load the menu. Please refresh the page.</p>';
        }
    }

    // Function to render the list
    function renderFoodList(rsvps) {
        if (rsvps.length === 0) {
            foodListContainer.innerHTML = '<p class="no-data">No one has RSVPed yet. Be the first!</p>';
            return;
        }

        foodListContainer.innerHTML = ''; // Clear container

        rsvps.forEach(rsvp => {
            const card = document.createElement('div');
            card.className = 'food-card';
            
            const header = document.createElement('div');
            header.className = 'food-card-header';
            
            const nameEl = document.createElement('span');
            nameEl.className = 'bringer-name';
            nameEl.textContent = rsvp.name;
            
            const isBringingEl = document.createElement('span');
            isBringingEl.textContent = 'is bringing:';
            isBringingEl.className = 'bringing-label';
            
            header.appendChild(nameEl);
            header.appendChild(isBringingEl);
            
            const foodEl = document.createElement('div');
            foodEl.className = 'food-item';
            foodEl.textContent = rsvp.food;
            
            card.appendChild(header);
            card.appendChild(foodEl);
            
            foodListContainer.appendChild(card);
        });
    }

    // Function to show form messages
    function showMessage(msg, type) {
        formMessage.textContent = msg;
        formMessage.className = `message ${type}`;
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.className = 'message hidden';
        }, 5000);
    }
});