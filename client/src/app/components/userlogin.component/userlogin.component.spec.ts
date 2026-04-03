import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserloginComponent } from './userlogin.component';

describe('UserloginComponent', () => {
    let component: UserloginComponent;
    let fixture: ComponentFixture<UserloginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UserloginComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(UserloginComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
