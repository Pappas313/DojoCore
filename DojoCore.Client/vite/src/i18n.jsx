import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Static fallback resources – used when the API is unavailable or a key is missing.
// Keys match the literal strings used in menu-items and components so t() works
// with both static bundles and API-loaded translations.
const staticResources = {
  en: {
    common: {
      // Profile section
      'profile.greeting': 'Good Morning,',
      'profile.accountSettings': 'Account Settings',
      'profile.profile': 'Profile',
      'profile.lightMode': 'Light Mode',
      'profile.darkMode': 'Dark Mode',
      'profile.logout': 'Logout',
      // Navigation groups
      Dashboard: 'Dashboard',
      Pages: 'Pages',
      'Pages Caption': 'Pages Caption',
      Utilities: 'Utilities',
      Admin: 'Admin',
      // Navigation items
      Authentication: 'Authentication',
      Login: 'Login',
      Register: 'Register',
      Typography: 'Typography',
      Color: 'Color',
      Shadow: 'Shadow',
      'Sample Page': 'Sample Page',
      Documentation: 'Documentation',
      'Menu Management': 'Menu Management',
      Translations: 'Translations',
      Athletes: 'Athletes',
      Coaches: 'Coaches',
      Managers: 'Managers',
      Gyms: 'Gyms',
      // Common actions
      Cancel: 'Cancel',
      Delete: 'Delete',
      Edit: 'Edit',
      Create: 'Create',
      Save: 'Save',
      'Save Changes': 'Save Changes',
      'Search…': 'Search…',
      // Common field labels
      Username: 'Username',
      Email: 'Email',
      Password: 'Password',
      'Email Address': 'Email Address',
      'New Password (optional)': 'New Password (optional)',
      'Date of Birth': 'Date of Birth',
      Gender: 'Gender',
      Status: 'Status',
      Address: 'Address',
      'Address (optional)': 'Address (optional)',
      Role: 'Role',
      Name: 'Name',
      Code: 'Code',
      Actions: 'Actions',
      // Gender / status options
      Male: 'Male',
      Female: 'Female',
      Pending: 'Pending',
      Active: 'Active',
      Inactive: 'Inactive',
      Suspended: 'Suspended',
      Unknown: 'Unknown',
      // Common dialog phrases
      'This action cannot be undone.': 'This action cannot be undone.',
      // Athletes page
      'Add Athlete': 'Add Athlete',
      'Edit Athlete': 'Edit Athlete',
      'New Athlete': 'New Athlete',
      'Delete Athlete': 'Delete Athlete',
      'Failed to load athletes.': 'Failed to load athletes.',
      'Failed to save athlete.': 'Failed to save athlete.',
      'Failed to delete athlete.': 'Failed to delete athlete.',
      'Are you sure you want to delete {{name}}? This action cannot be undone.':
        'Are you sure you want to delete {{name}}? This action cannot be undone.',
      // Coaches page
      'Add Coach': 'Add Coach',
      'Edit Coach': 'Edit Coach',
      'New Coach': 'New Coach',
      'Delete Coach': 'Delete Coach',
      'Failed to load coaches.': 'Failed to load coaches.',
      'Failed to save coach.': 'Failed to save coach.',
      'Failed to delete coach.': 'Failed to delete coach.',
      // Managers page
      'Add Manager': 'Add Manager',
      'Edit Manager': 'Edit Manager',
      'New Manager': 'New Manager',
      'Delete Manager': 'Delete Manager',
      'Failed to load managers.': 'Failed to load managers.',
      'Failed to save manager.': 'Failed to save manager.',
      'Failed to delete manager.': 'Failed to delete manager.',
      // Gyms page
      'Add Gym': 'Add Gym',
      'Edit Gym': 'Edit Gym',
      'New Gym': 'New Gym',
      'Delete Gym': 'Delete Gym',
      'Gym Name': 'Gym Name',
      'Failed to load gyms.': 'Failed to load gyms.',
      'Failed to save gym.': 'Failed to save gym.',
      'Failed to delete gym.': 'Failed to delete gym.',
      // Gym Memberships page
      'Gym Memberships': 'Gym Memberships',
      'Expand All': 'Expand All',
      'Collapse All': 'Collapse All',
      'Grouped by:': 'Grouped by:',
      Gym: 'Gym',
      'Search gyms or members…': 'Search gyms or members…',
      'No results match your search.': 'No results match your search.',
      'No gyms found.': 'No gyms found.',
      Athlete: 'Athlete',
      Coach: 'Coach',
      Manager: 'Manager',
      '{{n}} coaches': '{{n}} coaches',
      '{{n}} managers': '{{n}} managers',
      '{{n}} athletes': '{{n}} athletes',
      'No members': 'No members',
      // Translations page
      'Translation Management': 'Translation Management',
      'Page / Namespace': 'Page / Namespace',
      Key: 'Key',
      Value: 'Value',
      'Add a Row': 'Add a Row',
      All: 'All',
      'Delete Translation': 'Delete Translation',
      'Are you sure you want to delete the translation for key {{key}} in {{lang}}/{{page}}? This action cannot be undone.':
        'Are you sure you want to delete the translation for key {{key}} in {{lang}}/{{page}}? This action cannot be undone.',
      'Translation saved.': 'Translation saved.',
      'Translation deleted.': 'Translation deleted.',
      'Language, Page and Key are required.': 'Language, Page and Key are required.',
      'Access denied (401). You must be logged in as an Administrator to manage translations. Please log out and log in with an Admin account.':
        'Access denied (401). You must be logged in as an Administrator to manage translations. Please log out and log in with an Admin account.',
      'This page is restricted to Administrators. You are logged in as {{username}} (role {{role}}). Please log in with an Admin account.':
        'This page is restricted to Administrators. You are logged in as {{username}} (role {{role}}). Please log in with an Admin account.',
      // Menu Management page
      Title: 'Title',
      'Page Code': 'Page Code',
      URL: 'URL',
      Icon: 'Icon',
      Order: 'Order',
      'Add Item': 'Add Item',
      'New Menu Item': 'New Menu Item',
      'Delete Menu Item': 'Delete Menu Item',
      'Order Index': 'Order Index',
      'Parent Item': 'Parent Item',
      '— No parent (top-level group) —': '— No parent (top-level group) —',
      'No menu items found.': 'No menu items found.',
      'Title is required.': 'Title is required.',
      'Page Code is required.': 'Page Code is required.',
      'This will also delete all of its child items.': 'This will also delete all of its child items.',
      'Failed to save menu item.': 'Failed to save menu item.',
      'Failed to load menu items.': 'Failed to load menu items.',
      'Failed to delete menu item.': 'Failed to delete menu item.',
      // Auth – Login
      'Email Address / Username': 'Email Address / Username',
      'Keep me logged in': 'Keep me logged in',
      'Forgot Password?': 'Forgot Password?',
      'Sign In': 'Sign In',
      'Login failed. Please try again.': 'Login failed. Please try again.',
      'Email or username is required': 'Email or username is required',
      'Password is required': 'Password is required',
      // Auth – Register
      'Account Details': 'Account Details',
      'Athlete Status': 'Athlete Status',
      'Gym Setup': 'Gym Setup',
      'Min 3 characters': 'Min 3 characters',
      'Must be a valid email': 'Must be a valid email',
      'Password must be at least 8 characters': 'Password must be at least 8 characters',
      'Username is required': 'Username is required',
      'Email is required': 'Email is required',
      'Select a role': 'Select a role',
      'Role is required': 'Role is required',
      'Select a gender': 'Select a gender',
      'Gender is required': 'Gender is required',
      'Date of birth is required': 'Date of birth is required',
      'Select an option': 'Select an option',
      'Select a gym option': 'Select a gym option',
      'Gym name is required': 'Gym name is required',
      'Gym code is required': 'Gym code is required',
      'Max 20 characters': 'Max 20 characters',
      'Registration failed. Please try again.': 'Registration failed. Please try again.',
      Freelance: 'Freelance',
      'Belong to a gym': 'Belong to a gym',
      'User Code (optional)': 'User Code (optional)',
      'Code assigned by your gym': 'Code assigned by your gym',
      'New gym': 'New gym',
      'Belong to existing gym': 'Belong to existing gym',
      'Gym Code': 'Gym Code',
      'Gym Address (optional)': 'Gym Address (optional)',
      'Athlete Documents': 'Athlete Documents',
      'Upload certifications, ID, or any supporting documents (optional)':
        'Upload certifications, ID, or any supporting documents (optional)',
      'Gym Documents': 'Gym Documents',
      'Upload gym registration, license, or certification documents (optional)':
        'Upload gym registration, license, or certification documents (optional)',
      'Drag & drop files here or browse': 'Drag & drop files here or browse',
      browse: 'browse',
      'Sign up': 'Sign up',
      Next: 'Next',
      Back: 'Back',
      'Edit: {{title}}': 'Edit: {{title}}',
      // Auth pages
      'Hi, Welcome Back': 'Hi, Welcome Back',
      'Enter your credentials to continue': 'Enter your credentials to continue',
      "Don't have an account?": "Don't have an account?",
      'Enter your details to continue': 'Enter your details to continue',
      'Already have an account?': 'Already have an account?'
    }
  },
  gr: {
    common: {
      // Profile section
      'profile.greeting': 'Καλημέρα,',
      'profile.accountSettings': 'Ρυθμίσεις Λογαριασμού',
      'profile.profile': 'Προφίλ',
      'profile.lightMode': 'Φωτεινή Εμφάνιση',
      'profile.darkMode': 'Σκοτεινή Εμφάνιση',
      'profile.logout': 'Αποσύνδεση',
      // Navigation groups
      Dashboard: 'Πίνακας Ελέγχου',
      Pages: 'Σελίδες',
      'Pages Caption': 'Λεζάντα Σελίδων',
      Utilities: 'Εργαλεία',
      Admin: 'Διαχείριση',
      // Navigation items
      Authentication: 'Αυθεντικοποίηση',
      Login: 'Σύνδεση',
      Register: 'Εγγραφή',
      Typography: 'Τυπογραφία',
      Color: 'Χρώμα',
      Shadow: 'Σκιά',
      'Sample Page': 'Δείγμα Σελίδας',
      Documentation: 'Τεκμηρίωση',
      'Menu Management': 'Διαχείριση Μενού',
      Translations: 'Μεταφράσεις',
      Athletes: 'Αθλητές',
      Coaches: 'Προπονητές',
      Managers: 'Διαχειριστές',
      Gyms: 'Γυμναστήρια',
      // Common actions
      Cancel: 'Ακύρωση',
      Delete: 'Διαγραφή',
      Edit: 'Επεξεργασία',
      Create: 'Δημιουργία',
      Save: 'Αποθήκευση',
      'Save Changes': 'Αποθήκευση Αλλαγών',
      'Search…': 'Αναζήτηση…',
      // Common field labels
      Username: 'Όνομα Χρήστη',
      Email: 'Email',
      Password: 'Κωδικός',
      'Email Address': 'Διεύθυνση Email',
      'New Password (optional)': 'Νέος Κωδικός (προαιρετικό)',
      'Date of Birth': 'Ημ/νια Γέννησης',
      Gender: 'Φύλο',
      Status: 'Κατάσταση',
      Address: 'Διεύθυνση',
      'Address (optional)': 'Διεύθυνση (προαιρετική)',
      Role: 'Ρόλος',
      Name: 'Όνομα',
      Code: 'Κωδικός',
      Actions: 'Ενέργειες',
      // Gender / status options
      Male: 'Άνδρας',
      Female: 'Γυναίκα',
      Pending: 'Σε αναμονή',
      Active: 'Ενεργός',
      Inactive: 'Ανενεργός',
      Suspended: 'Αναστολή',
      Unknown: 'Άγνωστος',
      // Common dialog phrases
      'This action cannot be undone.': 'Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.',
      // Athletes page
      'Add Athlete': 'Προσθήκη Αθλητή',
      'Edit Athlete': 'Επεξεργασία Αθλητή',
      'New Athlete': 'Νέος Αθλητής',
      'Delete Athlete': 'Διαγραφή Αθλητή',
      'Failed to load athletes.': 'Αποτυχία φόρτωσης αθλητών.',
      'Failed to save athlete.': 'Αποτυχία αποθήκευσης αθλητή.',
      'Failed to delete athlete.': 'Αποτυχία διαγραφής αθλητή.',
      'Are you sure you want to delete {{name}}? This action cannot be undone.':
        'Είστε σίγουροι ότι θέλετε να διαγράψετε {{name}}; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.',
      // Coaches page
      'Add Coach': 'Προσθήκη Προπονητή',
      'Edit Coach': 'Επεξεργασία Προπονητή',
      'New Coach': 'Νέος Προπονητής',
      'Delete Coach': 'Διαγραφή Προπονητή',
      'Failed to load coaches.': 'Αποτυχία φόρτωσης προπονητών.',
      'Failed to save coach.': 'Αποτυχία αποθήκευσης προπονητή.',
      'Failed to delete coach.': 'Αποτυχία διαγραφής προπονητή.',
      // Managers page
      'Add Manager': 'Προσθήκη Διαχειριστή',
      'Edit Manager': 'Επεξεργασία Διαχειριστή',
      'New Manager': 'Νέος Διαχειριστής',
      'Delete Manager': 'Διαγραφή Διαχειριστή',
      'Failed to load managers.': 'Αποτυχία φόρτωσης διαχειριστών.',
      'Failed to save manager.': 'Αποτυχία αποθήκευσης διαχειριστή.',
      'Failed to delete manager.': 'Αποτυχία διαγραφής διαχειριστή.',
      // Gyms page
      'Add Gym': 'Προσθήκη Γυμναστηρίου',
      'Edit Gym': 'Επεξεργασία Γυμναστηρίου',
      'New Gym': 'Νέο Γυμναστήριο',
      'Delete Gym': 'Διαγραφή Γυμναστηρίου',
      'Gym Name': 'Όνομα Γυμναστηρίου',
      'Failed to load gyms.': 'Αποτυχία φόρτωσης γυμναστηρίων.',
      'Failed to save gym.': 'Αποτυχία αποθήκευσης γυμναστηρίου.',
      'Failed to delete gym.': 'Αποτυχία διαγραφής γυμναστηρίου.',
      // Gym Memberships page
      'Gym Memberships': 'Μέλη Γυμναστηρίων',
      'Expand All': 'Ανάπτυξη Όλων',
      'Collapse All': 'Σύμπτυξη Όλων',
      'Grouped by:': 'Ομαδοποίηση κατά:',
      Gym: 'Γυμναστήριο',
      'Search gyms or members…': 'Αναζήτηση γυμναστηρίων ή μελών…',
      'No results match your search.': 'Δεν βρέθηκαν αποτελέσματα.',
      'No gyms found.': 'Δεν βρέθηκαν γυμναστήρια.',
      Athlete: 'Αθλητής',
      Coach: 'Προπονητής',
      Manager: 'Διαχειριστής',
      '{{n}} coaches': '{{n}} προπονητές',
      '{{n}} managers': '{{n}} διαχειριστές',
      '{{n}} athletes': '{{n}} αθλητές',
      'No members': 'Χωρίς μέλη',
      // Translations page
      'Translation Management': 'Διαχείριση Μεταφράσεων',
      'Page / Namespace': 'Σελίδα / Χώρος Ονομάτων',
      Key: 'Κλειδί',
      Value: 'Τιμή',
      'Add a Row': 'Προσθήκη Γραμμής',
      All: 'Όλα',
      'Delete Translation': 'Διαγραφή Μετάφρασης',
      'Are you sure you want to delete the translation for key {{key}} in {{lang}}/{{page}}? This action cannot be undone.':
        'Είστε σίγουροι ότι θέλετε να διαγράψετε τη μετάφραση για το κλειδί {{key}} στο {{lang}}/{{page}}; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.',
      'Translation saved.': 'Η μετάφραση αποθηκεύτηκε.',
      'Translation deleted.': 'Η μετάφραση διαγράφηκε.',
      'Language, Page and Key are required.': 'Γλώσσα, Σελίδα και Κλειδί είναι υποχρεωτικά.',
      'Access denied (401). You must be logged in as an Administrator to manage translations. Please log out and log in with an Admin account.':
        'Πρόσβαση απορρίφθηκε (401). Πρέπει να συνδεθείτε ως Διαχειριστής.',
      'This page is restricted to Administrators. You are logged in as {{username}} (role {{role}}). Please log in with an Admin account.':
        'Αυτή η σελίδα είναι διαθέσιμη μόνο σε Διαχειριστές. Είστε συνδεδεμένος ως {{username}} (ρόλος {{role}}). Παρακαλώ συνδεθείτε με λογαριασμό Διαχειριστή.',
      Language: 'Γλώσσα',
      // Menu Management page
      Title: 'Τίτλος',
      'Page Code': 'Κωδικός Σελίδας',
      URL: 'URL',
      Icon: 'Εικονίδιο',
      Order: 'Σειρά',
      'Add Item': 'Προσθήκη Στοιχείου',
      'New Menu Item': 'Νέο Στοιχείο Μενού',
      'Delete Menu Item': 'Διαγραφή Στοιχείου Μενού',
      'Order Index': 'Σειρά Εμφάνισης',
      'Parent Item': 'Γονικό Στοιχείο',
      '— No parent (top-level group) —': '— Χωρίς γονικό (ομάδα κορυφής) —',
      'No menu items found.': 'Δεν βρέθηκαν στοιχεία μενού.',
      'Title is required.': 'Ο τίτλος είναι υποχρεωτικός.',
      'Page Code is required.': 'Ο κωδικός σελίδας είναι υποχρεωτικός.',
      'This will also delete all of its child items.': 'Αυτό θα διαγράψει και όλα τα υποστοιχεία του.',
      'Failed to save menu item.': 'Αποτυχία αποθήκευσης στοιχείου μενού.',
      'Failed to load menu items.': 'Αποτυχία φόρτωσης στοιχείων μενού.',
      'Failed to delete menu item.': 'Αποτυχία διαγραφής στοιχείου μενού.',
      // Auth – Login
      'Email Address / Username': 'Διεύθυνση Email / Όνομα Χρήστη',
      'Keep me logged in': 'Να με θυμάσαι',
      'Forgot Password?': 'Ξεχάσατε τον κωδικό;',
      'Sign In': 'Σύνδεση',
      'Login failed. Please try again.': 'Αποτυχία σύνδεσης. Παρακαλώ δοκιμάστε ξανά.',
      'Email or username is required': 'Απαιτείται email ή όνομα χρήστη',
      'Password is required': 'Απαιτείται κωδικός',
      // Auth – Register
      'Account Details': 'Στοιχεία Λογαριασμού',
      'Athlete Status': 'Κατάσταση Αθλητή',
      'Gym Setup': 'Ρύθμιση Γυμναστηρίου',
      'Min 3 characters': 'Ελάχιστο 3 χαρακτήρες',
      'Must be a valid email': 'Πρέπει να είναι έγκυρο email',
      'Password must be at least 8 characters': 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες',
      'Username is required': 'Το όνομα χρήστη είναι υποχρεωτικό',
      'Email is required': 'Το email είναι υποχρεωτικό',
      'Select a role': 'Επιλέξτε ρόλο',
      'Role is required': 'Ο ρόλος είναι υποχρεωτικός',
      'Select a gender': 'Επιλέξτε φύλο',
      'Gender is required': 'Το φύλο είναι υποχρεωτικό',
      'Date of birth is required': 'Η ημερομηνία γέννησης είναι υποχρεωτική',
      'Select an option': 'Επιλέξτε μια επιλογή',
      'Select a gym option': 'Επιλέξτε επιλογή γυμναστηρίου',
      'Gym name is required': 'Το όνομα γυμναστηρίου είναι υποχρεωτικό',
      'Gym code is required': 'Ο κωδικός γυμναστηρίου είναι υποχρεωτικός',
      'Max 20 characters': 'Μέγιστο 20 χαρακτήρες',
      'Registration failed. Please try again.': 'Αποτυχία εγγραφής. Παρακαλώ δοκιμάστε ξανά.',
      Freelance: 'Ανεξάρτητος',
      'Belong to a gym': 'Μέλος Γυμναστηρίου',
      'User Code (optional)': 'Κωδικός Χρήστη (προαιρετικό)',
      'Code assigned by your gym': 'Κωδικός από το γυμναστήριό σας',
      'New gym': 'Νέο Γυμναστήριο',
      'Belong to existing gym': 'Εγγραφή σε υπάρχον γυμναστήριο',
      'Gym Code': 'Κωδικός Γυμναστηρίου',
      'Gym Address (optional)': 'Διεύθυνση Γυμναστηρίου (προαιρετική)',
      'Athlete Documents': 'Έγγραφα Αθλητή',
      'Upload certifications, ID, or any supporting documents (optional)':
        'Ανεβάστε πιστοποιητικά, ταυτότητα ή άλλα έγγραφα (προαιρετικό)',
      'Gym Documents': 'Έγγραφα Γυμναστηρίου',
      'Upload gym registration, license, or certification documents (optional)':
        'Ανεβάστε καταστατικό, άδεια ή πιστοποιητικά γυμναστηρίου (προαιρετικό)',
      'Drag & drop files here or browse': 'Σύρετε αρχεία εδώ ή περιηγηθείτε',
      'Sign up': 'Εγγραφή',
      Next: 'Επόμενο',
      Back: 'Πίσω',
      'Edit: {{title}}': 'Επεξεργασία: {{title}}',
      browse: 'αναζήτηση',
      'Drag & drop files here or browse': 'Σύρτε & αποθέστε αρχεία ή',
      // Auth pages
      'Hi, Welcome Back': 'Καλώς ήλθατε ξανά',
      'Enter your credentials to continue': 'Εισάγετε τα στοιχεία σας για να συνεχίσετε',
      "Don't have an account?": 'Δεν έχετε λογαριασμό;',
      'Enter your details to continue': 'Εισάγετε τα στοιχεία σας για να συνεχίσετε',
      'Already have an account?': 'Έχετε ήδη λογαριασμό;'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',

    // All supported languages are bundled in staticResources above.
    // With partialBundledLanguages omitted (defaults to false), i18next treats
    // bundled languages as fully loaded and does NOT call any HTTP backend for
    // them — preventing an empty/401 backend response from overriding the static
    // Greek resources with a fallback to English.
    //
    // To enable live DB translations (e.g. admin overrides via Translation
    // Management page), re-add .use(HttpBackend) and uncomment the block below
    // ONLY after the database is seeded and the endpoint is publicly accessible:
    //
    // partialBundledLanguages: true,
    // backend: { loadPath: '/api/translations/{{lng}}/{{ns}}' },
    resources: staticResources,

    defaultNS: 'common',
    ns: ['common'],

    interpolation: {
      escapeValue: false
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded'
    }
  });

export default i18n;
