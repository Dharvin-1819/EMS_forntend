// ============================================================
// EventPro AI Chatbot Assistant Service
// Provides instant intelligent answers for event inquiries
// ============================================================

export const PRESET_QUESTIONS = [
  "Where is the event?",
  "What time does it start?",
  "Who is the chief guest?",
  "Is food available?",
  "What is the ticket price?",
  "Can I cancel and get a refund?"
];

/**
 * Resolves event properties with sensible defaults
 */
export function getEventAssistantDetails(event) {
  if (!event) return null;

  const title = event.title || 'Selected Event';
  const venue = event.venue || 'Main Event Venue';
  const location = event.location || 'City Centre';
  const dateFormatted = event.date
    ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date announced upon booking';
  const endDateFormatted = event.endDate && event.endDate !== event.date
    ? new Date(event.endDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const time = event.time || '09:00 AM';

  const chiefGuest = event.chiefGuest || (
    event.category === 'Technology' ? 'Distinguished Tech Visionaries & Industry Keynote Speakers' :
    event.category === 'Music' ? 'Celebrity Headline Artists & Maestro Conductors' :
    event.category === 'Business' ? 'Prominent Angel Investors & Unicorn Founders' :
    event.category === 'Sports' ? 'National Champions & Renowned Sports Personalities' :
    event.category === 'Food' ? 'Celebrity Masterchefs & Culinary Innovators' :
    event.category === 'Education' ? 'Senior Principal Engineers & Academic Leaders' :
    'Distinguished Keynote Speakers & Honored Dignitaries'
  );

  const foodAvailable = event.foodAvailable || (
    event.category === 'Food'
      ? 'Yes, complimentary gourmet tastings, masterclass sampling, and 50+ culinary stalls available.'
      : event.category === 'Health'
      ? 'Yes, wholesome organic vegetarian meals, detox herbal juices, and wellness refreshments included.'
      : event.category === 'Business'
      ? 'Yes, executive networking breakfast, buffet lunch, and high-tea included for delegates.'
      : 'Yes, food and beverage stalls, refreshment lounges, and drinking water stations are available at the venue.'
  );

  const price = Number(event.price || 0);
  const earlyBird = Number(event.earlyBirdPrice || 0);
  const ticketTypes = event.ticketTypes || [];

  return {
    title,
    venue,
    location,
    dateFormatted,
    endDateFormatted,
    time,
    chiefGuest,
    foodAvailable,
    price,
    earlyBird,
    ticketTypes,
    organizerName: event.organizerName || 'Event Organizing Committee',
    capacity: event.capacity || 1000,
    registered: event.registered || 0,
    category: event.category || 'General'
  };
}

/**
 * Answers questions about a specific event
 */
export function answerEventQuestion(query, event) {
  if (!event) {
    return "Please select an event so I can give you exact venue, timing, guest, and ticket details!";
  }

  const details = getEventAssistantDetails(event);
  const q = (query || '').toLowerCase().trim();

  // 1. Location / Venue: "Where is the event?"
  if (
    q.includes('where') ||
    q.includes('location') ||
    q.includes('venue') ||
    q.includes('address') ||
    q.includes('place') ||
    q.includes('how to reach') ||
    q.includes('directions') ||
    q.includes('city')
  ) {
    return `Location Details:\n` +
      `The event "${details.title}" will take place at:\n` +
      `${details.venue}, ${details.location}.\n\n` +
      `The venue is easily accessible via public transit, metro, and cabs. Dedicated visitor parking is available on-site.`;
  }

  // 2. Timing / Start time: "What time does it start?"
  if (
    q.includes('what time') ||
    q.includes('time') ||
    q.includes('start') ||
    q.includes('when') ||
    q.includes('schedule') ||
    q.includes('timing') ||
    q.includes('duration') ||
    q.includes('hours')
  ) {
    const endStr = details.endDateFormatted ? ` to ${details.endDateFormatted}` : '';
    return `Schedule & Timing:\n` +
      `"${details.title}" is scheduled for:\n` +
      `Date: ${details.dateFormatted}${endStr}\n` +
      `Starting Time: ${details.time}\n\n` +
      `Doors open 45 minutes prior to the start time for check-in and QR ticket validation. We recommend arriving early!`;
  }

  // 3. Chief Guest / Keynote: "Who is the chief guest?"
  if (
    q.includes('chief guest') ||
    q.includes('guest') ||
    q.includes('speaker') ||
    q.includes('keynote') ||
    q.includes('celebrity') ||
    q.includes('vip') ||
    q.includes('host') ||
    q.includes('who is speaking')
  ) {
    return `Chief Guest & Dignitaries:\n` +
      `The honored Chief Guest & Keynote Speaker for "${details.title}" is:\n` +
      `${details.chiefGuest}.\n\n` +
      `They will deliver the keynote address and participate in the interactive session with registered attendees.`;
  }

  // 4. Food & Refreshments: "Is food available?"
  if (
    q.includes('food') ||
    q.includes('lunch') ||
    q.includes('dinner') ||
    q.includes('snacks') ||
    q.includes('drinks') ||
    q.includes('eat') ||
    q.includes('meal') ||
    q.includes('refreshment') ||
    q.includes('catering') ||
    q.includes('beverage') ||
    q.includes('water')
  ) {
    return `Food & Refreshments:\n` +
      `${details.foodAvailable}\n\n` +
      `Clean drinking water points are stationed across the halls, and vegetarian/vegan choices are available.`;
  }

  // 5. Ticket Price & Booking: "What is the ticket price?"
  if (
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('ticket') ||
    q.includes('pass') ||
    q.includes('how much') ||
    q.includes('fee') ||
    q.includes('rate') ||
    q.includes('tier')
  ) {
    let priceText = `Ticket & Pricing Information:\n`;
    if (details.ticketTypes && details.ticketTypes.length > 0) {
      priceText += `Available Ticket Tiers:\n` +
        details.ticketTypes.map(t => `• ${t.name}: ₹${Number(t.price).toLocaleString()} (${t.available} seats left)`).join('\n') + `\n\n`;
    } else {
      priceText += `Regular Admission: ₹${details.price.toLocaleString()}\n`;
    }

    if (details.earlyBird > 0 && details.earlyBird < details.price) {
      priceText += `Early Bird Special: Available from ₹${details.earlyBird.toLocaleString()} (Save ₹${(details.price - details.earlyBird).toLocaleString()})!\n`;
    }
    priceText += `Coupon discounts can also be applied at checkout.`;
    return priceText;
  }

  // 6. Cancellation & Refund: "Can I cancel and get a refund?"
  if (
    q.includes('cancel') ||
    q.includes('refund') ||
    q.includes('money back') ||
    q.includes('policy') ||
    q.includes('return')
  ) {
    return `Cancellation & 100% Refund Policy:\n` +
      `Yes! EventPro guarantees a 100% full money-back refund on all cancelled bookings.\n\n` +
      `• Zero cancellation charges.\n` +
      `• Instant processing credited back to your original payment method.\n` +
      `• You can cancel anytime from your 'My Tickets' dashboard by submitting the cancellation feedback form.`;
  }

  // 7. Booking help: "How to book?"
  if (
    q.includes('how to book') ||
    q.includes('buy') ||
    q.includes('register') ||
    q.includes('purchase')
  ) {
    return `How to Book:\n` +
      `1. Select your preferred ticket tier on the event page.\n` +
      `2. Choose number of seats and click 'Book Now'.\n` +
      `3. Apply any promo coupon and complete checkout.\n` +
      `4. Your instant printable digital ticket with QR code will be generated immediately in 'My Tickets'.`;
  }

  // 8. Organizer inquiry
  if (q.includes('organizer') || q.includes('contact') || q.includes('who organized')) {
    return `Organizer Information:\n` +
      `This event is hosted by ${details.organizerName}.\n` +
      `For specific logistics inquiries, they can be reached via the EventPro message center.`;
  }

  // Default fallback answer
  return `Here is a quick summary for "${details.title}":\n` +
    `• Location: ${details.venue}, ${details.location}\n` +
    `• Date & Time: ${details.dateFormatted} at ${details.time}\n` +
    `• Chief Guest: ${details.chiefGuest}\n` +
    `• Food & Refreshments: ${details.foodAvailable}\n` +
    `• Price: Starting from ₹${details.price.toLocaleString()}\n\n` +
    `Feel free to click one of the suggested questions below for more details!`;
}
