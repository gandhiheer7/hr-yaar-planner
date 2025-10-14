document.addEventListener("DOMContentLoaded", () => {
  // Activities data structure - Cost removed, Duration standardized to 4
  const activities = {
    training: [
      { id: "train1", name: "Leadership Generation & Funnels", duration: 4 },
      { id: "train2", name: "Closing Deals", duration: 4 },
      { id: "train3", name: "Negotiation Skills", duration: 4 },
      { id: "train4", name: "Communication Skills", duration: 4 },
      { id: "train5", name: "Campus to Corporate (Part I)", duration: 4 },
      { id: "train6", name: "Campus to Corporate (Part II)", duration: 4 },
      { id: "train7", name: "Story Telling", duration: 4 },
      { id: "train8", name: "Productivity", duration: 4 },
      { id: "train9", name: "Art of Delegation", duration: 4 },
      { id: "train10", name: "AI: Prompt Engineering & Tools", duration: 4 },
      { id: "train11", name: "Conflict Management", duration: 4 },
      { id: "train12", name: "Winning Mindset", duration: 4 },
      { id: "train13", name: "Business Etiquettes", duration: 4 },
      { id: "train14", name: "Presentation Skills", duration: 4 },
      { id: "train15", name: "Pitching & Improvement", duration: 4 },
    ],
    engagement: [
      { id: "engage1", name: "Picnic & Team Games", duration: 2 },
      { id: "engage2", name: "Sports Tournament", duration: 6 },
      { id: "engage3", name: "Award Night", duration: 4 },
      { id: "engage4", name: "Masterchef", duration: 3 },
      { id: "engage5", name: "Treasure Hunt", duration: 2 },
      { id: "engage6", name: "Escape Room", duration: 2 },
      { id: "engage7", name: "Pottery", duration: 4 },
      { id: "engage8", name: "Art Workshop", duration: 3 },
      { id: "engage9", name: "Musical Evening", duration: 2 },
      { id: "engage10", name: "Standup Comedy", duration: 2 },
    ],
    wellness: [
      { id: "wellness1", name: "Yoga", duration: 1 },
      { id: "wellness2", name: "Zumba", duration: 1 },
      { id: "wellness3", name: "Mental Health Awareness", duration: 4 },
      { id: "wellness4", name: "Stress Management", duration: 2 },
      { id: "wellness5", name: "Diversity, Equity & Inclusion (DEI)", duration: 3 },
      { id: "wellness6", name: "Personal Finance", duration: 2 },
      { id: "wellness7", name: "Parenting", duration: 4 },
    ],
  };

  let selectedItems = [];

  const trainingList = document.getElementById("training-list");
  const engagementList = document.getElementById("engagement-list");
  const wellnessList = document.getElementById("wellness-list");
  const selectedItemsContainer = document.getElementById("selected-items");
  const totalDurationSpan = document.getElementById("total-duration");
  const bookingDate = document.getElementById("booking-date");
  
  // New form elements
  const proposalRequestBtn = document.getElementById("proposal-request-btn");
  const proposalForm = document.getElementById("proposal-form");
  const formMessage = document.getElementById("form-message");

  function renderActivityList(category, listElement) {
    listElement.innerHTML = activities[category].map(activity => `
      <li>
        <div class="item-info">
          <h4>${activity.name}</h4>
          <div class="item-details">${activity.duration} hours</div>
        </div>
        <button class="add-btn" data-id="${activity.id}" data-category="${category}">+</button>
      </li>
    `).join('');
  }

  renderActivityList("training", trainingList);
  renderActivityList("engagement", engagementList);
  renderActivityList("wellness", wellnessList);

  document.addEventListener("click", (e) => {
    if (e.target.matches(".add-btn") && !e.target.classList.contains("added")) {
      const activityId = e.target.dataset.id;
      const category = e.target.dataset.category;
      addActivity(activityId, category, e.target);
    } else if (e.target.matches(".remove-btn")) {
      const activityId = e.target.dataset.id;
      removeActivity(activityId);
    }
  });

  function addActivity(activityId, category, buttonElement) {
    const activity = activities[category].find((item) => item.id === activityId);
    if (activity && !selectedItems.find((item) => item.id === activityId)) {
      selectedItems.push({ ...activity, category });
      buttonElement.textContent = "✓";
      buttonElement.classList.add("added");
      updateSummary();
    }
  }

  function removeActivity(activityId) {
    selectedItems = selectedItems.filter((item) => item.id !== activityId);
    const addButton = document.querySelector(`[data-id="${activityId}"]`);
    if (addButton) {
      addButton.textContent = "+";
      addButton.classList.remove("added");
    }
    updateSummary();
  }

  function updateSummary() {
    if (selectedItems.length === 0) {
      selectedItemsContainer.innerHTML = '<p class="empty-message">No initiatives selected yet.</p>';
    } else {
      selectedItemsContainer.innerHTML = selectedItems.map((item) => `
        <div class="selected-item">
          <div class="item-info">
            <h4>${item.name}</h4>
            <div class="item-details">${item.duration} hours</div>
          </div>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      `).join("");
    }
    const totalDuration = selectedItems.reduce((sum, item) => sum + item.duration, 0);
    totalDurationSpan.textContent = `${totalDuration} hours`;
    proposalRequestBtn.disabled = selectedItems.length === 0;
  }

  proposalRequestBtn.addEventListener("click", () => {
    if (!bookingDate.value) {
      showMessage("Please select a preferred start date before requesting a proposal.", "error");
      return;
    }
    proposalRequestBtn.classList.add("hidden");
    proposalForm.classList.remove("hidden");
    showMessage("", ""); // Clear any previous messages
  });

  proposalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const finalSubmitBtn = document.getElementById("final-submit-btn");

    // 1. Gather all form data
    const formData = {
        name: document.getElementById("user-name").value,
        designation: document.getElementById("user-designation").value,
        company: document.getElementById("user-company").value,
        contact: document.getElementById("user-contact").value,
        email: document.getElementById("user-email").value,
        location: document.getElementById("user-location").value,
        preferredDate: bookingDate.value,
        initiatives: selectedItems,
        totalDuration: selectedItems.reduce((sum, item) => sum + item.duration, 0),
    };
    
    // Show loading state
    finalSubmitBtn.disabled = true;
    finalSubmitBtn.textContent = 'Submitting...';

    // 2. Generate PDF in the background
    const pdfElement = document.querySelector(".summary-booking-section .container");
    const pdfAsBase64 = await html2pdf().from(pdfElement).output('datauristring');
    
    // Add PDF data to the payload for the backend
    const payload = {
        ...formData,
        pdfData: pdfAsBase64
    };

    // 3. Send data to your backend
    const backendUrl = 'https://your-cloud-function-url.run.app/send-proposal';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Server responded with an error.');
        }

        const result = await response.json();
        showMessage("Thank you! Your proposal has been submitted. You will receive a copy in your email within a few minutes.", "success");
        // Reset form completely
        resetForm();

    } catch (error) {
        console.error("Submission Error:", error);
        showMessage("Sorry, there was an error submitting your proposal. Please try again later.", "error");
    } finally {
        finalSubmitBtn.disabled = false;
        finalSubmitBtn.textContent = 'Submit';
    }
  });

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
  }
  
  function resetForm() {
    selectedItems = [];
    document.querySelectorAll(".add-btn.added").forEach(btn => {
        btn.textContent = "+";
        btn.classList.remove("added");
    });
    updateSummary();
    bookingDate.value = "";
    proposalForm.reset();
    proposalForm.classList.add("hidden");
    proposalRequestBtn.classList.remove("hidden");
  }

  const today = new Date().toISOString().split("T")[0];
  bookingDate.setAttribute("min", today);
  updateSummary();
});