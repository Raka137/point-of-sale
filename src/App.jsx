import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Toast,
  ToastContainer,
  InputGroup,
} from "react-bootstrap";

// Data kategori statis untuk dropdown
const KATEGORI_OPTIONS = [
  "Elektronik",
  "Pakaian",
  "Makanan",
  "Minuman",
  "Lainnya",
];

export default function App() {
  const initialProducts = useMemo(
    () => [
      {
        id: 1,
        name: "Laptop Pro",
        description: "Laptop canggih untuk profesional.",
        harga: 15000000,
        kategori: "Elektronik",
        tanggalRilis: "2023-01-15",
        stok: 50,
        produkAktif: true,
      },
      {
        id: 2,
        name: "Kemeja Flanel",
        description: "Kemeja flanel bahan katun premium.",
        harga: 250000,
        kategori: "Pakaian",
        tanggalRilis: "2023-02-20",
        stok: 120,
        produkAktif: true,
      },
    ],
    []
  );

  // ===== STATE MANAGEMENT =====
  // 1. Mengambil data dari localStorage atau menggunakan data awal
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("products");
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });

  // 2. State untuk semua field form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [harga, setHarga] = useState("");
  const [kategori, setKategori] = useState("");
  const [tanggalRilis, setTanggalRilis] = useState("");
  const [stok, setStok] = useState(0);
  const [produkAktif, setProdukAktif] = useState(true);

  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // 3. State untuk notifikasi Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // ===== SIDE EFFECTS =====
  // Efek untuk menyimpan data ke localStorage setiap kali 'products' berubah
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // ===== FUNGSI-FUNGSI LOGIKA =====

  // Fungsi untuk validasi semua input
  const validate = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    // Validasi Nama Produk
    if (!name.trim()) newErrors.name = "Nama Produk wajib diisi.";
    else if (name.trim().length > 100)
      newErrors.name = "Maksimal 100 karakter.";

    // Validasi Deskripsi
    if (description.trim().length < 20)
      newErrors.description = "Deskripsi minimal 20 karakter.";

    // Validasi Harga
    if (!harga) newErrors.harga = "Harga wajib diisi.";
    else if (isNaN(harga) || Number(harga) <= 0)
      newErrors.harga = "Harga harus angka dan lebih dari 0.";

    // Validasi Kategori
    if (!kategori) newErrors.kategori = "Kategori wajib dipilih.";

    // Validasi Tanggal Rilis
    if (!tanggalRilis) newErrors.tanggalRilis = "Tanggal Rilis wajib diisi.";
    else if (tanggalRilis > today)
      newErrors.tanggalRilis = "Tanggal rilis tidak boleh di masa depan.";

    // Validasi Stok
    if (stok < 0) newErrors.stok = "Stok tidak boleh kurang dari 0.";

    return newErrors;
  };

  // Fungsi untuk membersihkan form dan mengembalikannya ke state awal
  const resetForm = () => {
    setName("");
    setDescription("");
    setHarga("");
    setKategori("");
    setTanggalRilis("");
    setStok(0);
    setProdukAktif(true);
    setErrors({});
    setEditingId(null);
  };

  const showToastMsg = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToastMsg("Periksa kembali input Anda.", "danger");
      return;
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      harga: Number(harga),
      kategori,
      tanggalRilis,
      stok: Number(stok),
      produkAktif,
    };

    if (editingId === null) {
      setProducts((prev) => [{ ...productData, id: Date.now() }, ...prev]);
      showToastMsg("Produk berhasil ditambahkan.", "success");
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...productData } : p))
      );
      showToastMsg("Produk berhasil diperbarui.", "success");
    }
    resetForm();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setHarga(product.harga);
    setKategori(product.kategori);
    setTanggalRilis(product.tanggalRilis);
    setStok(product.stok);
    setProdukAktif(product.produkAktif);
    setErrors({});
  };

  const handleDelete = (id) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const isConfirmed = window.confirm(`Hapus Produk "${target.name}"?`);
    if (!isConfirmed) return;

    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
    showToastMsg("Produk berhasil dihapus.", "success");
  };

  const isEditing = editingId !== null;

  return (
    <Container className="py-4">
      <Row>
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h5">
              {isEditing ? "Edit Produk" : "Tambah Produk"}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate>
                {/* Nama Produk */}
                <Form.Group className="mb-3">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    isInvalid={!!errors.name}
                    maxLength={100}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Deskripsi */}
                <Form.Group className="mb-3">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Harga */}
                <Form.Group className="mb-3">
                  <Form.Label>Harga</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>Rp</InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      isInvalid={!!errors.harga}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.harga}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Kategori */}
                <Form.Group className="mb-3">
                  <Form.Label>Kategori</Form.Label>
                  <Form.Select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    isInvalid={!!errors.kategori}
                  >
                    <option value="">Pilih Kategori...</option>
                    {KATEGORI_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.kategori}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Tanggal Rilis */}
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal Rilis</Form.Label>
                  <Form.Control
                    type="date"
                    value={tanggalRilis}
                    onChange={(e) => setTanggalRilis(e.target.value)}
                    isInvalid={!!errors.tanggalRilis}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.tanggalRilis}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Stok Tersedia */}
                <Form.Group className="mb-3">
                  <Form.Label>Stok Tersedia: {stok}</Form.Label>
                  <Form.Range
                    min="0"
                    max="1000"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                  />
                </Form.Group>

                {/* Produk Aktif */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Produk Aktif"
                    checked={produkAktif}
                    onChange={(e) => setProdukAktif(e.target.checked)}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant={isEditing ? "primary" : "success"}
                  >
                    {isEditing ? "Simpan Perubahan" : "Tambah Produk"}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk</Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Harga</th>
                    <th>Kategori</th>
                    <th>Stok</th>
                    <th>Status</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">
                        Belum ada data Produk.
                      </td>
                    </tr>
                  ) : (
                    products.map((p, idx) => (
                      <tr key={p.id}>
                        <td>{idx + 1}</td>
                        <td>{p.name}</td>
                        <td>
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(p.harga)}
                        </td>
                        <td>{p.kategori}</td>
                        <td>{p.stok}</td>
                        <td>{p.produkAktif ? "Aktif" : "Tidak Aktif"}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleEdit(p)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(p.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Notifikasi</strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === "danger" ? "text-white" : ""}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
