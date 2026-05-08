import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoriesAPI, { type Category } from "../../services/api/CategoriesAPI";
import { useAuth } from "../../context/AuthContext";
import { firebaseClientErrorToUserMessage } from "../../utils/firebaseUserFacingError";

export function GoogleCompletionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeGoogleRegistration } = useAuth();
  const prefill = (location.state as { prefill?: { name?: string; email?: string } } | null)?.prefill;

  const [name, setName] = useState(prefill?.name ?? "");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"user" | "organizer">("user");
  const [interests, setInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    CategoriesAPI.getAll()
      .then((cats) => setCategories(cats))
      .catch(() => setCategories([]))
      .finally(() => setIsLoadingCategories(false));
  }, []);

  const toggleInterest = (slug: string) => {
    setInterests((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (role === "user" && interests.length === 0) {
      setError("Veuillez sélectionner au moins un centre d'intérêt.");
      return;
    }
    setIsSubmitting(true);
    try {
      await completeGoogleRegistration({
        name: name.trim(),
        phone: phone.trim() || undefined,
        role,
        interests: role === "organizer" ? [] : interests,
      });
      navigate(role === "organizer" ? "/organizer" : "/dashboard", { replace: true });
    } catch (err: unknown) {
      setError(
        firebaseClientErrorToUserMessage(
          err,
          "Impossible de finaliser votre inscription Google. Vérifiez les informations saisies.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0434] text-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 border border-[rgba(192,169,237,0.4)] rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Compléter l'inscription Google</h1>
        <p className="text-sm text-white/70">Choisissez votre rôle et renseignez vos informations.</p>
        {prefill?.email ? <p className="text-sm text-white/70">Compte Google: {prefill.email}</p> : null}
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nom complet" className="w-full h-12 rounded-xl bg-transparent border border-[rgba(192,169,237,0.6)] px-4" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone (optionnel)" className="w-full h-12 rounded-xl bg-transparent border border-[rgba(192,169,237,0.6)] px-4" />
        <select value={role} onChange={(e) => setRole(e.target.value as "user" | "organizer")} className="w-full h-12 rounded-xl bg-transparent border border-[rgba(192,169,237,0.6)] px-4">
          <option value="user" className="text-black">Participant</option>
          <option value="organizer" className="text-black">Organisateur</option>
        </select>

        {role === "user" ? (
          <div className="space-y-3">
            <p className="text-sm text-white/80">Sélectionnez vos centres d'intérêt pour mieux personnaliser votre expérience.</p>
            {isLoadingCategories ? (
              <p className="text-sm text-white/70">Chargement des catégories...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-white/70">Aucune catégorie disponible pour le moment.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.slug}
                    onClick={() => toggleInterest(category.slug)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${interests.includes(category.slug) ? "border-[#C0A9ED] bg-white/10" : "border-[rgba(192,169,237,0.4)] bg-transparent"}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {error ? <p className="text-red-300 text-sm">{error}</p> : null}
        <button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-[#f4f6f4] text-black font-semibold disabled:opacity-50">
          {isSubmitting ? "Validation..." : role === "organizer" ? "Terminer et aller à l'espace organisateur" : "Terminer et aller au dashboard"}
        </button>
      </form>
    </div>
  );
}
