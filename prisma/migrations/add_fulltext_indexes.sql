-- Migration: Add Fulltext Indexes for Search
-- This migration adds fulltext indexes to improve search performance

-- Fulltext index on sach table (ten_sach, mo_ta)
ALTER TABLE sach ADD FULLTEXT INDEX idx_fulltext_sach (ten_sach, mo_ta) WITH PARSER ngram;

-- Fulltext index on tacgia table (ten_tac_gia)
ALTER TABLE tacgia ADD FULLTEXT INDEX idx_fulltext_tacgia (ten_tac_gia) WITH PARSER ngram;

-- Fulltext index on danhmuc table (ten_danh_muc)
ALTER TABLE danhmuc ADD FULLTEXT INDEX idx_fulltext_danhmuc (ten_danh_muc) WITH PARSER ngram;

-- Fulltext index on nhaxuatban table (ten_nha_xuat_ban)
ALTER TABLE nhaxuatban ADD FULLTEXT INDEX idx_fulltext_nhaxuatban (ten_nha_xuat_ban) WITH PARSER ngram;

-- Fulltext index on thuonghieu table (ten_thuong_hieu)
ALTER TABLE thuonghieu ADD FULLTEXT INDEX idx_fulltext_thuonghieu (ten_thuong_hieu) WITH PARSER ngram;

-- Note: ngram parser is used for better Vietnamese text search support
-- If ngram parser is not available, remove "WITH PARSER ngram" from the statements

