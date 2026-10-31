# The Mavericks Arena

PROMPT 1 — THE MAVERICKS: APPLICATION FOUNDATION
Act as a senior full-stack engineer and UI/UX designer. Build the foundation of a responsive team learning and accountability application called The Mavericks.
This is a private application designed exclusively for four team members to track daily learning, focused study hours, consistency and team progress.
1. TEAM MEMBERS AND LOGIN
There are exactly four members:
Aathitya
Anusri
Balaji
Nithya
Create a login screen with:
The Mavericks branding.
A dropdown containing exactly these four names.
A clear Enter the Arena button.
A welcoming introduction.
A polished, distinctive login experience.
For this initial version, implement member selection and persistent session handling. Structure authentication so individual PIN/password authentication can be added later.
Each member must have a unique, persistent user identity. Do not create duplicate profiles when they log in again.
2. DESIGN SYSTEM — VERY IMPORTANT
Follow this visual direction consistently.
Primary design style:
Neo-brutalism combined with glassmorphism.
Bright, clean, energetic and modern.
White/light backgrounds.
Bold typography.
Thick black borders where appropriate.
Offset shadows.
Geometric visual elements.
Glass-like translucent surfaces for overlays and floating elements.
Color palette:
White: #FFFFFF
Green: #16A34A
Electric Blue: #2563EB
Crimson Red: #DC2626
Primary text: #111827
Secondary background: #F8FAFC
Color usage:
Green: completed tasks, achievements, positive progress.
Electric blue: primary buttons, active navigation and highlights.
Crimson red: overdue tasks, warnings and missed targets.
White: primary canvas and card backgrounds.
Avoid excessive gradients, excessive rounded cards, generic SaaS templates and unnecessary animations.
Use bold editorial typography, clean spacing and strong visual hierarchy.
Guidance: bold typography, colorful analytics-inspired elements, bright backgrounds and neo-brutalist composition (solid drop shadows like shadow-[4px_4px_0px_#000], crisp 2px borders).
3. RESPONSIVE REQUIREMENTS
The application must be fully responsive.
Desktop:
Sidebar navigation.
Main content area.
Compact profile/header section.
Tablet:
Adaptable navigation.
Flexible grid layouts.
Mobile:
Mobile-first layout.
Bottom navigation or compact navigation drawer.
Cards should stack vertically.
No horizontal overflow.
Touch-friendly buttons and controls.
Charts must fit the available width.
Do not simply shrink desktop layouts. Design intentional mobile layouts.
4. APPLICATION STRUCTURE
Create three primary navigation destinations:
Today's Learning
Team Progress
My Profile
For now, implement the navigation, page shells and design foundations. The actual detailed functionality of these pages will be developed in subsequent prompts.
The shared application header should display:
The Mavericks logo/name.
Current logged-in member.
Profile/avatar.
Current learning streak placeholder.
Today's focused-time placeholder.
Use realistic sample UI data only where necessary. Clearly separate sample data from actual database records.
5. DATABASE AND BACKEND FOUNDATION
Use React, TypeScript, Tailwind CSS, Supabase / PostgreSQL.
Enable Lovable Cloud backend if available.
Create the initial database structures:
profiles:
id (UUID primary key)
display_name (Aathitya, Anusri, Balaji, Nithya)
avatar_url
created_at
updated_at
Enforce the four-member roster. Seed these 4 members cleanly. Profiles must not be created repeatedly.
Prepare a scalable structure for future learning_days, learning_tasks, member_task_progress and learning_sessions tables.
Implement appropriate Row Level Security policies.
6. CODE ARCHITECTURE
Organize the project into reusable components:
components/layout/
components/navigation/
components/auth/
components/ui/
features/learning/
features/progress/
features/profile/
hooks/
types/
7. IMPORTANT DEVELOPMENT RULES
Build a functional application, not a static screenshot.
Ensure navigation works.
Ensure login selection works.
Persist the selected member appropriately in state / storage.
Maintain a consistent neo-brutalist + glassmorphic design system.
EXPECTED RESULT:
A polished The Mavericks login page, 4-member selection, persistent member identity, responsive app shell (desktop sidebar + mobile bottom nav), three working navigation destinations, and clean database schema with the 4-member roster.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/06e43083-1e61-4057-abfc-e45253d08049).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
