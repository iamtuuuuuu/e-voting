use crate::schema::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

#[derive(Accounts)]
pub struct InitializeCandidate<'info> {
    // Địa chỉ ví thực hiện và trả phí giao dịch.
    #[account(mut)]
    pub authority: Signer<'info>,

    // Địa chỉ ứng viên. Mỗi ứng viên khác nhau có địa chỉ candidate khác nhau.
    #[account(init, payer = authority, space = Candidate::SIZE)]
    pub candidate: Account<'info, Candidate>,

    // Địa chỉ PDA quản lý candidate token account.
    // Được tạo thành với seeds là “treasurer” và địa chỉ của candidate.
    // Vậy nên candidate khác nhau có treasurer khác nhau.
    // Đối với những loại account không có kiểu dữ liệu cụ thể, cần thêm: /// CHECK: Just a pure account.
    #[account(seeds=[b"treasurer".as_ref(), &candidate.key().to_bytes()], bump)]
    /// CHECK: Just a pure account
    pub treasurer: AccountInfo<'info>,

    // Loại token được dùng để bỏ phiếu.
    pub mint: Box<Account<'info, token::Mint>>,

    // Địa chỉ Token Account dùng để khoá tạm thời token để ngăn tấn công Double Spend.
    #[account(init, payer = authority, associated_token::mint = mint, associated_token::authority = treasurer)]
    pub candidate_token_account: Account<'info, token::TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(ctx: Context<InitializeCandidate>, start_date: i64, end_date: i64) -> Result<()> {
    let candidate = &mut ctx.accounts.candidate;
    candidate.start_date = start_date;
    candidate.end_date = end_date;
    candidate.amount = 0;
    candidate.mint = ctx.accounts.mint.key();
    Ok(())
}
