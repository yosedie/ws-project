# ws-project
Service Oriented Architecture / Web Service Project

20 endpoint :
-login client(post)
-login user_resto (post)
-register client (post)
-register user_resto(post)
-hitung total transaksi customer (get) (yg udh dikurangi kupon)
-third party payment (Gopay, BCA, ...) (post)
-url scan qr code (get) utk transaksi
-cek semua htrans yang berhasil dari customer (get) (sbg admin)
-check out , return obj htrans (post) (?)
-update bahan restoran yang kurang (put)
-cek stock bahan dari restoran (get)
-add stock bahan dari restoran (bahan baru) (post)
-ubah status htrans customer (ke pending, ke "masih diproses", selesai) (put)
-lihat delivery bahan restoran yang diorder masih pending (get)
-ubah order customer (misal ada kesalahan data yang diinput) (put)
-Hitung Total Pendapatan Restoran
-review dari yang make layanan (client yg review jasa kita)
-hitung total harga n jumlah item di keranjang
-subscription ke jasa api kita
-add kupon (post)
-update kupon (put)

Nilai tambah :
docker container
mid trans api transaksi
git

api hit beli secara manual misal 500k dpt 100000 api hit
