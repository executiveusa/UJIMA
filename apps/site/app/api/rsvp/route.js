export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, childrenCount, ageRange, arrivalWindow, consent, volunteerInterest, schoolSuppliesInterest } = body || {};

    if (!name || !email) {
      return Response.json({ ok: false, error: 'Name and email are required fields.' }, { status: 400 });
    }

    if (!consent) {
      return Response.json({ ok: false, error: 'Consent to receive event communications is required.' }, { status: 400 });
    }

    const event = {
      id: `evt_rsvp_${Date.now()}`,
      tenantId: 'asc3nd',
      type: 'RSVP.SUBMITTED',
      payload: {
        name,
        email,
        phone: phone || null,
        childrenCount: Number(childrenCount) || 1,
        ageRange: ageRange || 'Mixed ages',
        arrivalWindow: arrivalWindow || 'Not sure yet',
        consent: Boolean(consent),
        volunteerInterest: Boolean(volunteerInterest),
        schoolSuppliesInterest: Boolean(schoolSuppliesInterest),
        submittedAt: new Date().toISOString()
      }
    };

    return Response.json({ ok: true, message: 'RSVP successfully registered.', event }, { status: 201 });
  } catch (e) {
    return Response.json({ ok: false, error: e.message || 'Internal server error' }, { status: 500 });
  }
}
